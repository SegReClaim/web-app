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
  PartnerWithRewards,
  RewardDoc,
  RewardCatalogueItem,
  ClaimLimitMode,
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
  phone: string = "",
  email: string = "",
  photoURL: string = ""
): Promise<void> {
  const ref = doc(db, "users", uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    // Backfill identity fields on older docs so accounts are recognisable
    // in the Firebase console / admin panel. Never touch points or streaks.
    const data = existing.data();
    const patch: Record<string, string> = {};
    if (email && data.email !== email) patch.email = email;
    if (photoURL && data.photoURL !== photoURL) patch.photoURL = photoURL;
    if (displayName && !data.displayName) patch.displayName = displayName;
    if (Object.keys(patch).length > 0) {
      try {
        await updateDoc(ref, patch);
      } catch (e) {
        // Non-fatal: older security rules may not allow self-updates yet
        console.warn("Could not backfill user profile fields:", e);
      }
    }
    return;
  }

  await setDoc(ref, {
    uid,
    displayName,
    phone,
    email,
    photoURL,
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

// ── Partners & Rewards ───────────────────────────────────────────

function isRewardCurrentlyValid(reward: RewardDoc, now = new Date()): boolean {
  if (!reward.active) return false;
  if (reward.validFrom && reward.validFrom.toDate() > now) return false;
  if (reward.validUntil && reward.validUntil.toDate() < now) return false;
  if (reward.stockMode === "limited" && (reward.remaining ?? 0) <= 0) return false;
  return true;
}

function legacyItemToReward(
  item: RewardCatalogueItem,
  partnerId: string,
  index: number
): RewardDoc {
  return {
    rewardId: `legacy-${partnerId}-${index}`,
    partnerId,
    title: item.description,
    description: item.description,
    pointsCost: item.pointsCost,
    stockMode: "limited",
    totalStock: item.totalStock,
    remaining: item.remaining,
    claimLimitMode: "unlimited",
    active: item.remaining > 0,
    featured: false,
    sortOrder: index,
    voucherValidityDays: 30,
  };
}

export async function getRewardsForPartnerPublic(
  partnerId: string
): Promise<RewardDoc[]> {
  try {
    const q = query(
      collection(db, "partners", partnerId, "rewards"),
      orderBy("sortOrder", "asc")
    );
    const snap = await getDocs(q);
    const rewards = snap.docs.map(
      (d) => ({ ...d.data(), rewardId: d.id } as RewardDoc)
    );
    if (rewards.length > 0) {
      return rewards.filter((r) => isRewardCurrentlyValid(r));
    }
  } catch {
    // Index may be missing — fall through to legacy
  }

  const partnerSnap = await getDoc(doc(db, "partners", partnerId));
  const catalogue = partnerSnap.data()?.rewardCatalogue as
    | RewardCatalogueItem[]
    | undefined;
  if (!catalogue?.length) return [];
  return catalogue
    .map((item, i) => legacyItemToReward(item, partnerId, i))
    .filter((r) => r.active);
}

export async function getActivePartners(): Promise<PartnerDoc[]> {
  const q = query(collection(db, "partners"), where("active", "==", true));
  const snap = await getDocs(q);
  const partners = snap.docs.map(
    (d) => ({ ...d.data(), partnerId: d.id } as PartnerDoc)
  );
  return partners.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getActivePartnersWithRewards(): Promise<PartnerWithRewards[]> {
  const partners = await getActivePartners();
  const withRewards = await Promise.all(
    partners.map(async (partner) => {
      const rewards = await getRewardsForPartnerPublic(partner.partnerId);
      return { ...partner, rewards };
    })
  );
  return withRewards.filter((p) => p.rewards.length > 0);
}

export async function getUserRewardClaimCount(
  userId: string,
  rewardId: string
): Promise<number> {
  if (rewardId.startsWith("legacy-")) return 0;
  try {
    const counterSnap = await getDoc(
      doc(db, "userRewardCounters", `${userId}_${rewardId}`)
    );
    if (counterSnap.exists()) {
      return counterSnap.data()?.count ?? 0;
    }
  } catch {
    // fall through
  }
  const q = query(
    collection(db, "rewardClaims"),
    where("userId", "==", userId),
    where("rewardId", "==", rewardId)
  );
  const snap = await getDocs(q);
  return snap.size;
}

export function getClaimLimitLabel(mode: ClaimLimitMode, max?: number): string {
  if (mode === "once") return "One per user";
  if (mode === "unlimited") return "Unlimited";
  return `Up to ${max ?? 1} per user`;
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

