import type { Timestamp } from "firebase/firestore";
import type { PartnerDoc, UserDoc } from "../types/index.ts";

export interface AdminActivityRecord {
  id: string;
  kind: "deposit" | "claim";
  userId: string | null;
  userName: string;
  userContact: string;
  machineId: string | null;
  machineName?: string | null;
  partnerName: string | null;
  title: string;
  timestamp: Timestamp | null;
  points: number | null;
  weightGrams: number;
  materials: string[];
  status: string;
  reference: string;
  items: { wasteType: string; weightGrams: number; pointsEarned: number | null }[];
  voucherCode?: string;
  expiresAt?: Timestamp | null;
  auditId?: string | null;
}

/** Match Firestore's descending timestamp/document-ID cursor order, including ties. */
export function compareActivityRecords(a: AdminActivityRecord, b: AdminActivityRecord): number {
  const byTimestamp = (b.timestamp?.toMillis() ?? 0) - (a.timestamp?.toMillis() ?? 0);
  if (byTimestamp !== 0) return byTimestamp;
  return a.id === b.id ? 0 : a.id > b.id ? -1 : 1;
}

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function amount(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function timestamp(value: unknown): Timestamp | null {
  const candidate = object(value);
  if (typeof candidate.toMillis !== "function" || typeof candidate.toDate !== "function") return null;
  try {
    return Number.isFinite(candidate.toMillis()) ? value as Timestamp : null;
  } catch {
    return null;
  }
}

function identity(userId: string | null, user: UserDoc | null | undefined, anonymous = false) {
  if (anonymous) return { userName: "Anonymous donation", userContact: "" };
  const profile = object(user);
  return {
    userName: text(profile.displayName) ?? (user ? "Unnamed user" : "Deleted user"),
    userContact: text(profile.phone) ?? text(profile.email) ?? userId ?? "",
  };
}

/** Read both the current multi-item transaction and the earlier kiosk donation shape. */
export function normalizeDeposit(id: string, data: unknown, user?: UserDoc | null): AdminActivityRecord {
  const row = object(data);
  const userId = text(row.userId);
  const anonymous = userId === null;
  const pending = row.pointsCalculated === false;
  const rawItems = Array.isArray(row.items) ? row.items : [];
  const items: AdminActivityRecord["items"] = rawItems
    .filter((item) => item !== null && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const entry = object(item);
      return {
        wasteType: text(entry.wasteType) ?? "general",
        weightGrams: amount(entry.weightGrams) ?? 0,
        pointsEarned: anonymous ? 0 : pending ? null : amount(entry.pointsEarned),
      };
    });
  const legacyPoints = amount(row.credits);
  if (!items.length && (text(row.category) || amount(row.weightGrams) !== null || amount(row.totalWeightGrams) !== null)) {
    items.push({
      wasteType: text(row.category) ?? "general",
      weightGrams: amount(row.weightGrams) ?? amount(row.totalWeightGrams) ?? 0,
      pointsEarned: anonymous ? 0 : pending ? null : amount(row.totalPoints) ?? legacyPoints,
    });
  }
  const itemPoints = items.length && items.every((item) => item.pointsEarned !== null)
    ? items.reduce((sum, item) => sum + (item.pointsEarned ?? 0), 0)
    : null;
  return {
    id,
    kind: "deposit",
    userId,
    ...identity(userId, user, anonymous),
    machineId: text(row.machineId) ?? text(row.kioskId),
    partnerName: null,
    title: anonymous ? "Anonymous donation" : "Recycling deposit",
    timestamp: timestamp(row.createdAt) ?? timestamp(row.timestamp),
    points: anonymous ? 0 : pending ? null : amount(row.totalPoints) ?? legacyPoints ?? itemPoints,
    weightGrams: amount(row.totalWeightGrams) ?? amount(row.weightGrams) ?? items.reduce((sum, item) => sum + item.weightGrams, 0),
    materials: [...new Set(items.map((item) => item.wasteType))],
    status: anonymous ? "donated" : pending ? "processing" : "completed",
    reference: text(row.tokenId) ?? text(row.sessionId) ?? id,
    items,
    auditId: null,
  };
}

/** Vouchers are the claim ledger; newer rewardClaims documents provide an optional audit link. */
export function normalizeClaim(
  id: string,
  voucherData: unknown,
  user?: UserDoc | null,
  partner?: PartnerDoc | null,
  audit?: { claimId: string } | null,
): AdminActivityRecord {
  const row = object(voucherData);
  const userId = text(row.userId);
  const expiresAt = timestamp(row.expiresAt);
  const recordedStatus = text(row.status) ?? "active";
  const status = recordedStatus === "redeemed" ? "redeemed"
    : recordedStatus === "active" && expiresAt && expiresAt.toMillis() <= Date.now() ? "expired"
    : recordedStatus;
  const spent = amount(row.pointsSpent);
  return {
    id,
    kind: "claim",
    userId,
    ...identity(userId, user),
    machineId: null,
    partnerName: text(row.partnerName) ?? text(object(partner).name) ?? text(row.brandName) ?? text(row.partnerId),
    title: text(row.description) ?? text(row.title) ?? "Reward claim",
    timestamp: timestamp(row.createdAt) ?? timestamp(row.claimedAt),
    points: spent === null ? null : spent === 0 ? 0 : -spent,
    weightGrams: 0,
    materials: [],
    status,
    reference: id,
    items: [],
    voucherCode: text(row.code) ?? "",
    expiresAt,
    auditId: text(audit?.claimId),
  };
}
