import { pathToFileURL } from "node:url";
import { createDemoData, summarizeDemoData } from "./demo-data.mjs";

export const DEMO_PROJECT = "demo-segreclaim";
export const DEMO_ADMIN = { email: "admin@example.test", password: "SegReClaimDemo123!" };

export function emulatorUrl(host, fallbackPort) {
  const raw = host || `127.0.0.1:${fallbackPort}`;
  if (raw.includes("://")) throw new Error("Emulator host must be host:port without a protocol");
  const url = new URL(`http://${raw}`);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      !url.port || url.pathname !== "/" || url.username || url.password || url.search || url.hash) {
    throw new Error("Demo seeding is restricted to a local loopback emulator host:port");
  }
  return url.origin;
}

export function firestoreValue(value) {
  if (value === null) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(firestoreValue) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value)
    ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "object") return {
    mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, firestoreValue(item)])) },
  };
  throw new Error(`Unsupported Firestore value: ${typeof value}`);
}

async function post(url, body, fetchImpl) {
  const response = await fetchImpl(url, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? `Emulator returned HTTP ${response.status}`);
  return result;
}

export async function seedDemo({
  projectId = DEMO_PROJECT, firestoreHost, authHost, withAdmin = false,
  now = new Date(), dryRun = false, fetchImpl = fetch,
} = {}) {
  if (!/^demo-[a-z0-9-]+$/.test(projectId)) {
    throw new Error("Refusing to seed: project ID must start with demo-");
  }
  const firestoreBase = emulatorUrl(firestoreHost, 8080);
  const authBase = withAdmin ? emulatorUrl(authHost, 9099) : null;
  const documents = createDemoData({ now });
  if (dryRun) return { projectId, dryRun: true, counts: summarizeDemoData(documents), withAdmin };
  if (withAdmin) {
    const endpoint = `${authBase}/identitytoolkit.googleapis.com/v1/accounts:`;
    let account;
    try {
      account = await post(`${endpoint}signUp?key=demo-key`, { ...DEMO_ADMIN, returnSecureToken: true }, fetchImpl);
    } catch (error) {
      if (!error.message.includes("EMAIL_EXISTS")) throw error;
      account = await post(`${endpoint}signInWithPassword?key=demo-key`, { ...DEMO_ADMIN, returnSecureToken: true }, fetchImpl);
    }
    if (!account.localId) throw new Error("Auth emulator returned no admin UID");
    documents.push({ path: `users/${account.localId}`, data: {
      uid: account.localId, displayName: "Demo Administrator", phone: "", email: DEMO_ADMIN.email,
      role: "superadmin", totalPoints: 0, lifetimePoints: 0, currentStreak: 0, bestStreak: 0,
      lastActivityDate: null, createdAt: new Date(now), isDemo: true, demoDataset: "segreclaim-local-v1",
    } });
  }
  for (let offset = 0; offset < documents.length; offset += 400) {
    const writes = documents.slice(offset, offset + 400).map(({ path, data }) => ({
      update: {
        name: `projects/${projectId}/databases/(default)/documents/${path}`,
        fields: firestoreValue(data).mapValue.fields,
      },
    }));
    await post(`${firestoreBase}/v1/projects/${projectId}/databases/(default)/documents:commit`, { writes }, fetchImpl);
  }
  return { projectId, dryRun: false, counts: summarizeDemoData(documents),
    ...(withAdmin ? { adminEmail: DEMO_ADMIN.email } : {}) };
}

async function main() {
  const allowed = new Set(["--dry-run", "--with-admin"]);
  if (process.argv.slice(2).some((arg) => !allowed.has(arg))) {
    throw new Error("Usage: node scripts/seed-demo.mjs [--dry-run] [--with-admin]");
  }
  const result = await seedDemo({
    projectId: process.env.DEMO_FIREBASE_PROJECT_ID || DEMO_PROJECT,
    firestoreHost: process.env.FIRESTORE_EMULATOR_HOST,
    authHost: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    now: process.env.DEMO_REFERENCE_DATE || new Date(),
    dryRun: process.argv.includes("--dry-run"), withAdmin: process.argv.includes("--with-admin"),
  });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Demo seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}
