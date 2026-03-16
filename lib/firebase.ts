import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { Functions, getFunctions, httpsCallable } from "firebase/functions";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
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
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app, "us-central1");
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
  { partnerId: string; catalogueIndex: number },
  { success: boolean; voucherId: string }
>(functions, "claimVoucher");

export { app, auth, db, functions, claimVoucherFn };
