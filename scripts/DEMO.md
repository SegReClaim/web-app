# Local admin demo

The fixture contains fictional Indian user profiles and linked deposit histories,
reward claims and vouchers. Every record carries `isDemo: true` and
`demoDataset: segreclaim-local-v1`. It is kept in the local `demo-segreclaim`
Firebase project, separate from live users. Email addresses use `example.test`;
phone numbers are intentionally non-routable. Partner brands are fictional.

Run these commands from `rvm-web` in separate PowerShell terminals:

```powershell
# Terminal 1: start local Auth and Firestore emulators; Java 21+ is required.
npm run demo:emulators

# Terminal 2: populate Firestore and create the local demo administrator.
npm run demo:seed

# Terminal 3: connect the development frontend to those emulators.
npm run demo:dev
```

Open `http://localhost:3100/login` and select **Open demo admin**. The emulator-only
administrator is `admin@example.test` with password `SegReClaimDemo123!`. The
frontend displays a local demo indicator. Only this administrator gets a local
Auth account; fictional users are Firestore profiles for reviewing admin data.

Without npm aliases, the equivalent commands are:

```powershell
powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File scripts/start-demo.ps1
node scripts/seed-demo.mjs --with-admin
node scripts/start-demo-app.mjs
node --test scripts/demo-data.test.mjs
```

The startup script discovers Java on PATH, via `JAVA_HOME`, or in a JetBrains JBR.
It copies the current backend rules and indexes to a temporary emulator project.
CLI preferences, downloads and emulator logs stay under
`$env:TEMP\segreclaim-demo-runtime`; existing Firebase credentials are unused.
The initial emulator download requires network access. This does not start Cloud
Functions, so the demo covers the admin reads and histories, not new reward
fulfilment or real kiosk events. Restart emulators after changing backend rules.

The Auth emulator listens on `127.0.0.1:9099`, Firestore on `127.0.0.1:8080`, and
the Emulator Suite UI on `127.0.0.1:4000`. Stop the emulator terminal with Ctrl+C
when finished. Records are in memory; rerun the seed after restarting. Repeated
seeding overwrites the fixture's deterministic document IDs and reuses the same
local administrator. It does not delete unrelated emulator records.

## Preview and checks

```powershell
# No network calls or writes.
node scripts/seed-demo.mjs --dry-run

# Fixed dates produce the same dataset for repeatable screenshots/tests.
$env:DEMO_REFERENCE_DATE = '2026-11-12T12:00:00Z'
node scripts/seed-demo.mjs --dry-run

# Tests exercise linked records, point balances at every point in history,
# stock/counters, timestamps, endpoint restrictions and the REST write payload.
npm run demo:check
```

The dataset has 12 user profiles (including one new user without activity),
97 credited deposits, three anonymous donations, 21 reward claims and matching
vouchers, three machines, three partners, four rewards, six point rules,
58 redemption tokens, and 45 completed sessions. The administrator adds a 13th
profile when `--with-admin` is used. Voucher states cover active, redeemed and
expired; token states cover redeemed, donated, pending, claimed and expired.
Deposits include both the session schema and current kiosk token schema.

The seed script refuses any project ID without a `demo-` prefix and any endpoint
outside loopback. Optional `FIRESTORE_EMULATOR_HOST`,
`FIREBASE_AUTH_EMULATOR_HOST`, and `DEMO_FIREBASE_PROJECT_ID` environment variables
are subject to these guards. It never reads service account files, Firebase CLI
tokens, application default credentials, or the frontend environment file.
