import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  UserDoc,
  SessionDoc,
  TransactionDoc,
  VoucherDoc,
  PartnerDoc,
} from "@/types";

// ── User ────────────────────────────────────────────────────────

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

export function subscribeToUserDoc(
  uid: string,
  callback: (user: UserDoc) => void
): Unsubscribe {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) callback(snap.data() as UserDoc);
  });
}

export async function createUserDoc(
  uid: string,
  displayName: string,
  phone: string = ""
): Promise<void> {
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return; // never overwrite
  await setDoc(ref, {
    uid,
    displayName,
    phone,
    totalPoints: 0,
    lifetimePoints: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: null,
    createdAt: serverTimestamp(),
  });
}

// ── Transactions ─────────────────────────────────────────────────

export async function getTransactions(
  uid: string,
  limitCount: number = 10
): Promise<TransactionDoc[]> {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), transactionId: d.id } as TransactionDoc));
}

// ── Partners ─────────────────────────────────────────────────────

export async function getActivePartners(): Promise<PartnerDoc[]> {
  const q = query(
    collection(db, "partners"),
    where("active", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), partnerId: d.id } as PartnerDoc));
}

// ── Vouchers ─────────────────────────────────────────────────────

export async function getUserVouchers(uid: string): Promise<VoucherDoc[]> {
  const q = query(
    collection(db, "vouchers"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), voucherId: d.id } as VoucherDoc));
}

export async function markVoucherRedeemed(voucherId: string): Promise<void> {
  await updateDoc(doc(db, "vouchers", voucherId), {
    status: "redeemed",
  });
}

// ── Sessions ─────────────────────────────────────────────────────

export async function getSession(sessionId: string): Promise<SessionDoc | null> {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  if (!snap.exists()) return null;
  return snap.data() as SessionDoc;
}

export async function linkSession(
  sessionId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, "sessions", sessionId), {
    userId,
    status: "active",
  });
}

// ── Machine ──────────────────────────────────────────────────────
import { MachineDoc, RedemptionTokenDoc } from "@/types";

export async function getMachine(machineId: string): Promise<MachineDoc | null> {
  const snap = await getDoc(doc(db, "machines", machineId));
  if (!snap.exists()) return null;
  return snap.data() as MachineDoc;
}

// ── Redemption Tokens ────────────────────────────────────────────

export async function getRedemptionToken(
  tokenId: string
): Promise<RedemptionTokenDoc | null> {
  const snap = await getDoc(doc(db, "redemptionTokens", tokenId));
  if (!snap.exists()) return null;
  return snap.data() as RedemptionTokenDoc;
}

