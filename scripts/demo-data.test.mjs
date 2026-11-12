import test from "node:test";
import assert from "node:assert/strict";
import { createDemoData, summarizeDemoData } from "./demo-data.mjs";
import { DEMO_ADMIN, emulatorUrl, firestoreValue, seedDemo } from "./seed-demo.mjs";

const now = new Date("2026-11-12T12:00:00Z");
const documents = createDemoData({ now });
const byPath = new Map(documents.map((doc) => [doc.path, doc.data]));
const inCollection = (name) => documents.filter(({ path }) => path.startsWith(`${name}/`)).map(({ data }) => data);

test("dataset is deterministic, isolated and has all admin activity types", () => {
  assert.deepEqual(createDemoData({ now }), documents);
  assert.equal(byPath.size, documents.length);
  for (const { path, data } of documents) {
    assert.ok(path.startsWith("pointRules/") || path.split("/").at(-1).startsWith("demo-"));
    assert.equal(data.isDemo, true);
    assert.equal(data.demoDataset, "segreclaim-local-v1");
  }
  assert.deepEqual(summarizeDemoData(documents), {
    machines: 3, pointRules: 6, partners: 3, rewards: 4, users: 12,
    redemptionTokens: 58, transactions: 100, sessions: 45,
    vouchers: 21, rewardClaims: 21, userRewardCounters: 21,
  });
  assert.ok(inCollection("users").every((u) => u.email.endsWith("@example.test")));
  assert.ok(inCollection("users").some((u) => u.lifetimePoints === 0));
  assert.deepEqual(new Set(inCollection("vouchers").map((v) => v.status)), new Set(["active", "redeemed", "expired"]));
  assert.deepEqual(new Set(inCollection("redemptionTokens").map((t) => t.status)),
    new Set(["redeemed", "donated", "pending", "claimed", "expired"]));
});

test("deposit totals, users, machine references and kiosk tokens agree", () => {
  for (const tx of inCollection("transactions")) {
    assert.ok(byPath.has(`machines/${tx.machineId}`));
    if (tx.type === "donation") {
      assert.equal(tx.userId, null);
      assert.equal(byPath.get(`redemptionTokens/${tx.tokenId}`).status, "donated");
      continue;
    }
    assert.ok(byPath.has(`users/${tx.userId}`));
    assert.equal(tx.totalPoints, tx.items.reduce((s, i) => s + i.pointsEarned, 0));
    assert.equal(tx.totalWeightGrams, tx.items.reduce((s, i) => s + i.weightGrams, 0));
    assert.ok(tx.createdAt <= now);
    if (tx.tokenId) {
      const token = byPath.get(`redemptionTokens/${tx.tokenId}`);
      assert.equal(token.userId, tx.userId);
      assert.equal(token.credits, tx.totalPoints);
      assert.equal(token.weightGrams, tx.totalWeightGrams);
      assert.ok(token.redeemedAt < token.expiresAt);
    } else assert.equal(byPath.get(`sessions/${tx.sessionId}`).userId, tx.userId);
  }
});

test("reward claims, balances, historical balances, stock and counters reconcile", () => {
  for (const claim of inCollection("rewardClaims")) {
    const voucher = byPath.get(`vouchers/${claim.voucherId}`);
    const reward = byPath.get(`partners/${claim.partnerId}/rewards/${claim.rewardId}`);
    assert.ok(byPath.has(`users/${claim.userId}`));
    assert.equal(voucher.rewardId, reward.rewardId);
    assert.equal(voucher.userId, claim.userId);
    assert.equal(voucher.pointsSpent, reward.pointsCost);
    assert.equal(+voucher.createdAt, +claim.claimedAt);
    assert.ok(voucher.createdAt <= now);
    assert.equal(voucher.status === "expired", voucher.expiresAt < now);
  }
  for (const user of inCollection("users")) {
    const txs = inCollection("transactions").filter((t) => t.userId === user.uid);
    const vouchers = inCollection("vouchers").filter((v) => v.userId === user.uid);
    const earned = txs.reduce((s, t) => s + t.totalPoints, 0);
    assert.equal(user.lifetimePoints, earned);
    assert.equal(user.totalPoints, earned - vouchers.reduce((s, v) => s + v.pointsSpent, 0));
    const timeline = [...txs.map((t) => [t.createdAt, t.totalPoints]),
      ...vouchers.map((v) => [v.createdAt, -v.pointsSpent])].sort((a, b) => a[0] - b[0]);
    let balance = 0;
    for (const [, delta] of timeline) {
      balance += delta;
      assert.ok(balance >= 0, `Negative historic balance for ${user.uid}`);
    }
    assert.ok(user.lastActivityDate === null || user.lastActivityDate >= user.createdAt);
  }
  for (const { path, data: reward } of documents.filter(({ path }) => path.includes("/rewards/"))) {
    const claims = inCollection("rewardClaims").filter((c) => c.rewardId === reward.rewardId);
    assert.equal(reward.remaining, reward.totalStock - claims.length, path);
    assert.ok(reward.remaining >= 0);
  }
  for (const counter of inCollection("userRewardCounters")) {
    assert.equal(counter.count, inCollection("rewardClaims")
      .filter((c) => c.userId === counter.userId && c.rewardId === counter.rewardId).length);
  }
});

test("emulator guard rejects remote endpoints and production projects before any request", async () => {
  for (const host of ["firestore.googleapis.com:443", "192.168.1.3:8080", "127.0.0.1:8080/path",
    "127.0.0.1:8080?x=1", "http://127.0.0.1:8080", "owner@localhost:8080", "localhost"]) {
    assert.throws(() => emulatorUrl(host, 8080));
  }
  assert.equal(emulatorUrl("localhost:8080", 8080), "http://localhost:8080");
  assert.equal(emulatorUrl("[::1]:8080", 8080), "http://[::1]:8080");
  const neverFetch = async () => { throw new Error("Unexpected network request"); };
  await assert.rejects(seedDemo({ projectId: "segreclaim-live", fetchImpl: neverFetch }), /demo-/);
  const result = await seedDemo({ dryRun: true, now, fetchImpl: neverFetch });
  assert.equal(result.counts.users, 12);
});

test("seeder serializes timestamps and writes only local demo project paths", async () => {
  assert.deepEqual(firestoreValue(now), { timestampValue: now.toISOString() });
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => url.includes("signUp") ? { localId: "demo-admin-uid" } : {} };
  };
  const result = await seedDemo({ now, withAdmin: true, fetchImpl });
  assert.equal(result.adminEmail, DEMO_ADMIN.email);
  assert.equal(result.counts.users, 13);
  for (const { url, body } of requests) {
    assert.equal(new URL(url).hostname, "127.0.0.1");
    for (const write of body.writes ?? []) {
      assert.ok(write.update.name.startsWith("projects/demo-segreclaim/databases/(default)/documents/"));
      assert.equal(write.update.fields.isDemo.booleanValue, true);
    }
  }
  const created = requests.flatMap((r) => r.body.writes ?? []);
  assert.equal(created.length, documents.length + 1);
  const admin = created.find((w) => w.update.name.endsWith("users/demo-admin-uid"));
  assert.equal(admin.update.fields.role.stringValue, "superadmin");
});

test("rerun reuses local admin and surfaces emulator failures", async () => {
  const fetchImpl = async (url) => url.includes("signUp")
    ? { ok: false, json: async () => ({ error: { message: "EMAIL_EXISTS" } }) }
    : { ok: true, json: async () => url.includes("signInWithPassword") ? { localId: "demo-admin-uid" } : {} };
  assert.equal((await seedDemo({ now, withAdmin: true, fetchImpl })).counts.users, 13);
  await assert.rejects(seedDemo({ now, fetchImpl: async () => ({ ok: false,
    status: 403, json: async () => ({ error: { message: "PERMISSION_DENIED" } }) }) }), /PERMISSION_DENIED/);
});
