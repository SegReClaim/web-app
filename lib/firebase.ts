import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth, connectAuthEmulator } from "firebase/auth";
import { Firestore, getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { Functions, getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

// Production builds always use the configured live Firebase project, even if
// a local demo flag is accidentally carried into the hosting environment.
export const isEmulatorMode = process.env.NODE_ENV === "development"
  && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

const apiKey = isEmulatorMode ? "demo-api-key" : process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey,
  authDomain: isEmulatorMode ? "demo-segreclaim.firebaseapp.com" : process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: isEmulatorMode ? "demo-segreclaim" : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Only fully initialise Firebase when credentials are present.
// In dev, if .env.local is empty the app still loads — auth features just won't work.
const isConfigured = Boolean(apiKey);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;

if (isConfigured) {
  const appName = isEmulatorMode ? "segreclaim-demo" : "[DEFAULT]";
  const existing = getApps().find((candidate) => candidate.name === appName);
  app = existing ?? initializeApp(firebaseConfig, appName);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app, "us-central1");
  if (isEmulatorMode && !existing) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  }
} else {
  // Provide stub instances during dev without credentials
  // (Firebase will not be callable, but the UI will render)
  app = getApps().length === 0
    ? initializeApp({ ...firebaseConfig, apiKey: "__placeholder__" })
    : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app, "us-central1");
  if (typeof window !== "undefined") {
    console.warn(
      "[SegReClaim] Firebase credentials not configured.\n" +
        "Fill in NEXT_PUBLIC_FIREBASE_* values in .env.local and restart the dev server."
    );
  }
}

// Callable Cloud Function reference
const claimVoucherFn = httpsCallable<
  {
    rewardId?: string;
    partnerId: string;
    catalogueIndex?: number;
  },
  { success: boolean; voucherId: string }
>(functions, "claimVoucher");

export { app, auth, db, functions, claimVoucherFn };
