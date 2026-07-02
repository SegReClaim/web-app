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
  serverTimestamp,
  Timestamp,
  collectionGroup,
  limit,
  deleteField,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  PartnerDoc,
  PartnerFormData,
  RewardDoc,
  RewardFormData,
  RewardClaimDoc,
  UserDoc,
  UserRole,
  TransactionDoc,
  VoucherDoc,
} from "@/types";

// Firestore rejects `undefined` field values, so form payloads with blank
// optional fields would throw before reaching the server.
function stripUndefined<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as T;
}

// For updates, map `undefined` to deleteField() so clearing a field in the
// form actually removes it from the document.
function undefinedToDelete<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === undefined ? deleteField() : v])
  );
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDateInput(value: string): Timestamp | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
}

export function rewardFormToDoc(
  data: RewardFormData,
  rewardId: string,
  createdBy: string,
  existing?: RewardDoc
): Omit<RewardDoc, "createdAt" | "updatedAt"> & {
  createdAt?: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
} {
  const limited = data.stockMode === "limited";
  const totalStock = limited ? Math.max(0, data.totalStock) : undefined;
  const remaining =
    limited
      ? existing?.stockMode === "limited" && existing.remaining !== undefined
        ? Math.min(existing.remaining, totalStock ?? 0)
        : totalStock
      : undefined;

  let maxClaimsPerUser: number | undefined;
  if (data.claimLimitMode === "once") maxClaimsPerUser = 1;
  else if (data.claimLimitMode === "limited") maxClaimsPerUser = Math.max(1, data.maxClaimsPerUser);
  else maxClaimsPerUser = undefined;

  return {
    rewardId,
    partnerId: data.partnerId,
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim() || undefined,
    brandName: data.brandName.trim() || undefined,
    tags: data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined,
    pointsCost: Math.max(0, data.pointsCost),
    rupeeValue: data.rupeeValue === "" ? undefined : Number(data.rupeeValue),
    stockMode: data.stockMode,
    totalStock,
    remaining,
    claimLimitMode: data.claimLimitMode,
    maxClaimsPerUser,
    active: data.active,
    featured: data.featured,
    sortOrder: data.sortOrder,
    validFrom: parseDateInput(data.validFrom),
    validUntil: parseDateInput(data.validUntil),
    voucherValidityDays: Math.max(1, data.voucherValidityDays),
    redemptionInstructions: data.redemptionInstructions.trim() || undefined,
    createdBy: existing?.createdBy ?? createdBy,
    ...(existing ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  };
}

export function rewardDocToForm(reward: RewardDoc, partnerId: string): RewardFormData {
  return {
    partnerId,
    title: reward.title,
    description: reward.description,
    imageUrl: reward.imageUrl ?? "",
    brandName: reward.brandName ?? "",
    tags: reward.tags?.join(", ") ?? "",
    pointsCost: reward.pointsCost,
    rupeeValue: reward.rupeeValue ?? "",
    stockMode: reward.stockMode,
    totalStock: reward.totalStock ?? 0,
    claimLimitMode: reward.claimLimitMode,
    maxClaimsPerUser: reward.maxClaimsPerUser ?? 1,
    active: reward.active,
    featured: reward.featured,
    sortOrder: reward.sortOrder,
    voucherValidityDays: reward.voucherValidityDays,
    redemptionInstructions: reward.redemptionInstructions ?? "",
    validFrom: reward.validFrom
      ? reward.validFrom.toDate().toISOString().slice(0, 16)
      : "",
    validUntil: reward.validUntil
      ? reward.validUntil.toDate().toISOString().slice(0, 16)
      : "",
  };
}

export function defaultRewardForm(partnerId = ""): RewardFormData {
  return {
    partnerId,
    title: "",
    description: "",
    imageUrl: "",
    brandName: "",
    tags: "",
    pointsCost: 100,
    rupeeValue: "",
    stockMode: "limited",
    totalStock: 50,
    claimLimitMode: "once",
    maxClaimsPerUser: 1,
    active: true,
    featured: false,
    sortOrder: 0,
    voucherValidityDays: 30,
    redemptionInstructions: "",
    validFrom: "",
    validUntil: "",
  };
}

export function defaultPartnerForm(): PartnerFormData {
  return {
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    contactEmail: "",
    websiteUrl: "",
    active: true,
    sortOrder: 0,
  };
}

export function partnerFormToDoc(
  data: PartnerFormData,
  partnerId: string,
  existing?: PartnerDoc
) {
  return {
    partnerId,
    name: data.name.trim(),
    slug: data.slug.trim() || slugify(data.name),
    logoUrl: data.logoUrl.trim(),
    description: data.description.trim() || undefined,
    contactEmail: data.contactEmail.trim() || undefined,
    websiteUrl: data.websiteUrl.trim() || undefined,
    active: data.active,
    sortOrder: data.sortOrder,
    ...(existing ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  };
}

export function partnerDocToForm(partner: PartnerDoc): PartnerFormData {
  return {
    name: partner.name,
    slug: partner.slug ?? slugify(partner.name),
    logoUrl: partner.logoUrl ?? "",
    description: partner.description ?? "",
    contactEmail: partner.contactEmail ?? "",
    websiteUrl: partner.websiteUrl ?? "",
    active: partner.active,
    sortOrder: partner.sortOrder ?? 0,
  };
}

// ── Partners (admin) ────────────────────────────────────────────

export async function getAllPartners(): Promise<PartnerDoc[]> {
  const snap = await getDocs(collection(db, "partners"));
  const partners = snap.docs.map(
    (d) => ({ ...d.data(), partnerId: d.id } as PartnerDoc)
  );
  return partners.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getPartner(partnerId: string): Promise<PartnerDoc | null> {
  const snap = await getDoc(doc(db, "partners", partnerId));
  if (!snap.exists()) return null;
  return { ...snap.data(), partnerId: snap.id } as PartnerDoc;
}

export async function createPartner(
  data: PartnerFormData
): Promise<string> {
  const ref = doc(collection(db, "partners"));
  await setDoc(ref, stripUndefined(partnerFormToDoc(data, ref.id)));
  return ref.id;
}

export async function updatePartner(
  partnerId: string,
  data: PartnerFormData
): Promise<void> {
  const existing = await getPartner(partnerId);
  if (!existing) throw new Error("Partner not found");
  await updateDoc(
    doc(db, "partners", partnerId),
    undefinedToDelete(partnerFormToDoc(data, partnerId, existing))
  );
}

// ── Rewards (admin) ─────────────────────────────────────────────

export async function getRewardsForPartner(partnerId: string): Promise<RewardDoc[]> {
  const q = query(
    collection(db, "partners", partnerId, "rewards"),
    orderBy("sortOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), rewardId: d.id } as RewardDoc));
}

export async function getAllRewardsAdmin(): Promise<RewardDoc[]> {
  try {
    const q = query(collectionGroup(db, "rewards"), orderBy("sortOrder", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), rewardId: d.id } as RewardDoc));
  } catch {
    // Collection-group index may still be building — fetch unordered and
    // sort client-side
    const snap = await getDocs(collectionGroup(db, "rewards"));
    return snap.docs
      .map((d) => ({ ...d.data(), rewardId: d.id } as RewardDoc))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }
}

export async function getReward(
  partnerId: string,
  rewardId: string
): Promise<RewardDoc | null> {
  const snap = await getDoc(doc(db, "partners", partnerId, "rewards", rewardId));
  if (!snap.exists()) return null;
  return { ...snap.data(), rewardId: snap.id } as RewardDoc;
}

export async function createReward(
  data: RewardFormData,
  adminUid: string
): Promise<string> {
  if (!data.partnerId) throw new Error("Partner is required");
  const ref = doc(collection(db, "partners", data.partnerId, "rewards"));
  await setDoc(ref, stripUndefined(rewardFormToDoc(data, ref.id, adminUid)));
  return ref.id;
}

export async function updateReward(
  partnerId: string,
  rewardId: string,
  data: RewardFormData,
  adminUid: string
): Promise<void> {
  const existing = await getReward(partnerId, rewardId);
  if (!existing) throw new Error("Reward not found");
  await updateDoc(
    doc(db, "partners", partnerId, "rewards", rewardId),
    undefinedToDelete(rewardFormToDoc(data, rewardId, adminUid, existing))
  );
}

export async function setRewardActive(
  partnerId: string,
  rewardId: string,
  active: boolean
): Promise<void> {
  await updateDoc(doc(db, "partners", partnerId, "rewards", rewardId), {
    active,
    updatedAt: serverTimestamp(),
  });
}

// ── Stats ───────────────────────────────────────────────────────

export async function getAdminStats(): Promise<{
  partnerCount: number;
  activePartnerCount: number;
  rewardCount: number;
  activeRewardCount: number;
  lowStockCount: number;
  claimCount: number;
  userCount: number;
}> {
  // Aggregate counts avoid downloading whole collections just to count them
  const [partners, rewards, claimsAgg, usersAgg] = await Promise.all([
    getAllPartners(),
    getAllRewardsAdmin(),
    getCountFromServer(collection(db, "rewardClaims")),
    getCountFromServer(collection(db, "users")),
  ]);

  const now = new Date();
  const activeRewards = rewards.filter((r) => {
    if (!r.active) return false;
    if (r.validFrom && r.validFrom.toDate() > now) return false;
    if (r.validUntil && r.validUntil.toDate() < now) return false;
    return true;
  });

  const lowStockCount = rewards.filter(
    (r) => r.active && r.stockMode === "limited" && (r.remaining ?? 0) < 5
  ).length;

  return {
    partnerCount: partners.length,
    activePartnerCount: partners.filter((p) => p.active).length,
    rewardCount: rewards.length,
    activeRewardCount: activeRewards.length,
    lowStockCount,
    claimCount: claimsAgg.data().count,
    userCount: usersAgg.data().count,
  };
}

// ── Users (admin) ───────────────────────────────────────────────

export async function getAllUsers(): Promise<UserDoc[]> {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserDoc));
  } catch {
    // Some legacy docs may lack createdAt — fall back to unordered fetch
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserDoc));
  }
}

export async function getRecentUsers(max = 5): Promise<UserDoc[]> {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as UserDoc));
  } catch {
    return (await getAllUsers()).slice(0, max);
  }
}

export async function getUserAdmin(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { ...snap.data(), uid: snap.id } as UserDoc;
}

/** Superadmin only (enforced by security rules) */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, "users", uid), { role });
}

export async function getUserTransactionsAdmin(
  uid: string,
  max = 20
): Promise<TransactionDoc[]> {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), transactionId: d.id } as TransactionDoc));
  } catch {
    // Composite index may be missing — fetch by userId and sort client-side
    const q = query(collection(db, "transactions"), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...d.data(), transactionId: d.id } as TransactionDoc))
      .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
      .slice(0, max);
  }
}

export async function getUserVouchersAdmin(
  uid: string,
  max = 20
): Promise<VoucherDoc[]> {
  try {
    const q = query(
      collection(db, "vouchers"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), voucherId: d.id } as VoucherDoc));
  } catch {
    const q = query(collection(db, "vouchers"), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...d.data(), voucherId: d.id } as VoucherDoc))
      .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
      .slice(0, max);
  }
}

export async function getRecentClaims(max = 20): Promise<RewardClaimDoc[]> {
  try {
    const q = query(
      collection(db, "rewardClaims"),
      orderBy("claimedAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), claimId: d.id } as RewardClaimDoc));
  } catch {
    const snap = await getDocs(collection(db, "rewardClaims"));
    return snap.docs
      .map((d) => ({ ...d.data(), claimId: d.id } as RewardClaimDoc))
      .slice(0, max);
  }
}
