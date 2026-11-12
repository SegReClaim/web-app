import assert from "node:assert/strict";
import test from "node:test";
import { compareActivityRecords, normalizeClaim, normalizeDeposit } from "../lib/admin-activity-model.ts";

const stamp = (milliseconds) => ({
  toMillis: () => milliseconds,
  toDate: () => new Date(milliseconds),
});

test("pagination ties match descending Firestore document-ID order across letter cases", () => {
  const records = ["Z", "9", "z", "a"].map((id) => normalizeDeposit(id, { createdAt: stamp(100) }));
  assert.deepEqual(records.sort(compareActivityRecords).map((row) => row.id), ["z", "a", "Z", "9"]);
  for (const a of records) {
    for (const b of records) {
      if (a.id === b.id) assert.equal(compareActivityRecords(a, b), 0);
      else assert.equal(compareActivityRecords(a, b), -compareActivityRecords(b, a));
    }
  }
  assert.equal(compareActivityRecords(records[0], { ...records[0] }), 0);
});

test("pagination uses descending timestamps before IDs and treats missing timestamps as zero", () => {
  const records = [
    normalizeDeposit("z", {}),
    normalizeDeposit("a", { createdAt: stamp(20) }),
    normalizeDeposit("A", { createdAt: stamp(10) }),
    normalizeDeposit("Z", { createdAt: stamp(0) }),
  ];
  assert.deepEqual(records.sort(compareActivityRecords).map((row) => row.id), ["a", "A", "z", "Z"]);
  assert.equal(compareActivityRecords(normalizeDeposit("a", {}), normalizeDeposit("a", { createdAt: stamp(0) })), 0);
});

test("current deposits preserve item details and resolved user identity", () => {
  const createdAt = stamp(100);
  const result = normalizeDeposit("tx-1", {
    userId: "uid-1", machineId: "rvm-1", sessionId: "session-1", createdAt,
    items: [
      { wasteType: "plastic", weightGrams: 150, pointsEarned: 15 },
      { wasteType: "paper", weightGrams: 200, pointsEarned: 10 },
      { wasteType: "plastic", weightGrams: 50, pointsEarned: 5 },
    ],
    totalPoints: 30, totalWeightGrams: 400, pointsCalculated: true,
  }, { displayName: "Aditi Shah", phone: "+919876543210" });
  assert.equal(result.kind, "deposit");
  assert.equal(result.userName, "Aditi Shah");
  assert.equal(result.userContact, "+919876543210");
  assert.equal(result.timestamp, createdAt);
  assert.equal(result.points, 30);
  assert.equal(result.weightGrams, 400);
  assert.deepEqual(result.materials, ["plastic", "paper"]);
  assert.equal(result.items.length, 3);
  assert.equal(result.reference, "session-1");
  assert.equal(result.status, "completed");
});

test("pending calculation does not present provisional points as awarded", () => {
  const result = normalizeDeposit("pending", {
    userId: "deleted-uid", pointsCalculated: false, totalPoints: 100,
    items: [{ wasteType: "glass", weightGrams: 250, pointsEarned: 100 }],
  });
  assert.equal(result.points, null);
  assert.equal(result.items[0].pointsEarned, null);
  assert.equal(result.status, "processing");
  assert.equal(result.userName, "Deleted user");
  assert.equal(result.userContact, "deleted-uid");
});

test("legacy anonymous donations retain material and weight without awarding credits", () => {
  const time = stamp(200);
  const result = normalizeDeposit("donation-1", {
    type: "donation", userId: null, kioskId: "kiosk-1", category: "aluminium",
    weightGrams: 350, credits: 70, timestamp: time, tokenId: "token-1",
  });
  assert.equal(result.userId, null);
  assert.equal(result.userName, "Anonymous donation");
  assert.equal(result.machineId, "kiosk-1");
  assert.equal(result.timestamp, time);
  assert.equal(result.points, 0);
  assert.equal(result.weightGrams, 350);
  assert.equal(result.reference, "token-1");
  assert.equal(result.status, "donated");
  assert.deepEqual(result.items, [{ wasteType: "aluminium", weightGrams: 350, pointsEarned: 0 }]);
});

test("item totals supply missing aggregate values and retain a legitimate zero", () => {
  const data = { userId: "u", items: [
    { wasteType: "glass", weightGrams: 20, pointsEarned: 0 },
    { wasteType: "paper", weightGrams: 30, pointsEarned: 5 },
  ] };
  assert.equal(normalizeDeposit("id", data).points, 5);
  assert.equal(normalizeDeposit("id", data).weightGrams, 50);
  assert.equal(normalizeDeposit("id", { ...data, totalPoints: 0 }).points, 0);
  assert.equal(normalizeDeposit("id", { userId: "u", category: "metal", credits: 7 }).points, 7);
});

test("legacy and audited vouchers resolve the same claim ledger entry", () => {
  const result = normalizeClaim("voucher-1", {
    userId: "uid-1", partnerId: "partner-1", description: "Coffee reward",
    code: "COFFEE123", pointsSpent: 125, status: "active", expiresAt: stamp(Date.now() + 60_000),
  }, { displayName: "Rohan Mehta", email: "rohan@example.test" }, { name: "Cafe Partner" }, { claimId: "claim-1" });
  assert.equal(result.kind, "claim");
  assert.equal(result.points, -125);
  assert.equal(result.partnerName, "Cafe Partner");
  assert.equal(result.userContact, "rohan@example.test");
  assert.equal(result.title, "Coffee reward");
  assert.equal(result.voucherCode, "COFFEE123");
  assert.equal(result.reference, "voucher-1");
  assert.equal(result.auditId, "claim-1");
  assert.equal(result.status, "active");
  assert.equal(normalizeClaim("legacy", { partnerName: "Historic partner", brandName: "Brand", pointsSpent: 0 }).partnerName, "Historic partner");
  assert.equal(normalizeClaim("legacy", { brandName: "Brand", partnerId: "p" }).partnerName, "Brand");
  assert.equal(normalizeClaim("legacy", { partnerId: "p" }).partnerName, "p");
});

test("voucher expiry includes its boundary and redeemed status takes precedence", () => {
  const originalNow = Date.now;
  Date.now = () => 1_000;
  try {
    assert.equal(normalizeClaim("v", { status: "active", expiresAt: stamp(1_001) }).status, "active");
    assert.equal(normalizeClaim("v", { status: "active", expiresAt: stamp(1_000) }).status, "expired");
    assert.equal(normalizeClaim("v", { status: "active", expiresAt: stamp(999) }).status, "expired");
    assert.equal(normalizeClaim("v", { status: "redeemed", expiresAt: stamp(999) }).status, "redeemed");
  } finally {
    Date.now = originalNow;
  }
});

test("malformed optional data cannot crash history or fabricate numeric values", () => {
  for (const malformed of [null, undefined, false, [], "invalid"]) {
    assert.doesNotThrow(() => normalizeDeposit("d", malformed));
    assert.doesNotThrow(() => normalizeClaim("c", malformed));
  }
  const result = normalizeDeposit("d", {
    userId: "u", totalPoints: NaN, totalWeightGrams: Infinity,
    items: [null, "invalid", { weightGrams: -1, pointsEarned: "100" }],
    createdAt: { toMillis: () => { throw new Error("bad timestamp"); }, toDate: () => new Date() },
  });
  assert.equal(result.timestamp, null);
  assert.equal(result.points, null);
  assert.equal(result.weightGrams, 0);
  assert.equal(result.items.length, 1);
  assert.equal(normalizeClaim("c", { pointsSpent: -50, expiresAt: "yesterday" }).points, null);
  assert.equal(normalizeClaim("c", { pointsSpent: 0 }).points, 0);
});
