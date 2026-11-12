import {
  collection, documentId, getCountFromServer, getDocs, limit,
  orderBy, query, startAfter, where,
  type DocumentData, type QueryConstraint, type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { compareActivityRecords, normalizeClaim, normalizeDeposit, type AdminActivityRecord } from "./admin-activity-model";
import type { PartnerDoc, UserDoc } from "@/types";

export type { AdminActivityRecord } from "./admin-activity-model";
export type ActivityKind = "transactions" | "deposits" | "claims";
type Source = "deposits" | "donations" | "claims";
export interface ActivityCursor {
  kind: ActivityKind;
  userId?: string;
  positions: Partial<Record<Source, QueryDocumentSnapshot<DocumentData>>>;
}

async function fetchByIds<T>(name: string, ids: string[]): Promise<Map<string, T>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const result = new Map<string, T>();
  await Promise.all(Array.from({ length: Math.ceil(unique.length / 30) }, async (_, i) => {
    const chunk = unique.slice(i * 30, (i + 1) * 30);
    const snap = await getDocs(query(collection(db, name), where(documentId(), "in", chunk)));
    snap.docs.forEach((d) => result.set(d.id, { ...d.data(), uid: d.id, partnerId: d.id } as T));
  }));
  return result;
}

/** Merge independent, cursor-paginated streams without skipping unconsumed rows.
 * Vouchers are the issuance ledger: legacy claims predate rewardClaims.
 * Donations have a separate timestamp field in the kiosk's original schema.
 */
export async function getActivityPage(
  kind: ActivityKind,
  options: { cursor?: ActivityCursor | null; pageSize?: number; userId?: string } = {},
): Promise<{ records: AdminActivityRecord[]; cursor: ActivityCursor | null; hasMore: boolean }> {
  const size = Math.min(100, Math.max(1, options.pageSize ?? 25));
  const previous = options.cursor;
  if (previous && (previous.kind !== kind || previous.userId !== options.userId)) {
    throw new Error("History changed. Refresh to start again.");
  }
  const sources: Source[] = kind === "claims" ? ["claims"]
    : kind === "deposits" ? ["deposits", ...(options.userId ? [] : ["donations" as const])]
    : ["deposits", ...(options.userId ? [] : ["donations" as const]), "claims"];
  const batches = await Promise.all(sources.map(async (source) => {
    const name = source === "claims" ? "vouchers" : "transactions";
    const field = source === "donations" ? "timestamp" : "createdAt";
    const constraints: QueryConstraint[] = [];
    if (options.userId) constraints.push(where("userId", "==", options.userId));
    // Only the original donation schema uses timestamp. No composite index
    // is needed for the global stream, and no older deposits are hidden.
    constraints.push(orderBy(field, "desc"));
    if (previous?.positions[source]) constraints.push(startAfter(previous.positions[source]));
    constraints.push(limit(size + 1));
    const snap = await getDocs(query(collection(db, name), ...constraints));
    return { source, docs: snap.docs };
  }));
  const candidates = batches.flatMap(({ source, docs }) => docs.map((snapshot) => ({ source, snapshot })));
  const claimDocs = candidates.filter(({ source }) => source === "claims");
  const [users, partners, machines] = await Promise.all([
    fetchByIds<UserDoc>("users", candidates.map(({ snapshot }) => snapshot.data().userId)),
    fetchByIds<PartnerDoc>("partners", claimDocs.map(({ snapshot }) => snapshot.data().partnerId)),
    fetchByIds<{ locationName?: string }>("machines", candidates.filter(({ source }) => source !== "claims").map(({ snapshot }) => snapshot.data().machineId)),
  ]);
  const audits = new Map<string, { claimId: string }>();
  // Audit records enrich issuance, but cannot hide legacy vouchers.
  await Promise.all(Array.from({ length: Math.ceil(claimDocs.length / 30) }, async (_, i) => {
    const ids = claimDocs.slice(i * 30, (i + 1) * 30).map(({ snapshot }) => snapshot.id);
    if (!ids.length) return;
    const auditConstraints: QueryConstraint[] = [where("voucherId", "in", ids)];
    const snap = await getDocs(query(collection(db, "rewardClaims"), ...auditConstraints));
    snap.docs.forEach((d) => audits.set(d.data().voucherId, { claimId: d.id }));
  }));
  const rows = candidates.map((candidate) => {
    const { snapshot, source } = candidate;
    const data = snapshot.data();
    const user = users.get(data.userId);
    const record = source === "claims"
      ? normalizeClaim(snapshot.id, data, user, partners.get(data.partnerId), audits.get(snapshot.id))
      : normalizeDeposit(snapshot.id, data, user);
    return { ...candidate, record: { ...record, machineName: record.machineId ? machines.get(record.machineId)?.locationName ?? null : null } };
  }).sort((a, b) => compareActivityRecords(a.record, b.record));
  const unique = [...new Map(rows.map((row) => [`${row.record.kind}:${row.record.id}`, row])).values()];
  const selected = unique.slice(0, size);
  const consumed = new Set(selected.map(({ record }) => `${record.kind}:${record.id}`));
  const positions = { ...previous?.positions };
  for (const { source, docs } of batches) {
    for (const snapshot of docs) {
      const key = `${source === "claims" ? "claim" : "deposit"}:${snapshot.id}`;
      if (!consumed.has(key)) break;
      positions[source] = snapshot;
    }
  }
  const hasMore = unique.length > size;
  return {
    records: selected.map(({ record }) => record),
    cursor: selected.length ? { kind, userId: options.userId, positions } : null,
    hasMore,
  };
}

export async function getActivityCounts() {
  const [deposits, claims, processing] = await Promise.all([
    getCountFromServer(collection(db, "transactions")),
    getCountFromServer(collection(db, "vouchers")),
    getCountFromServer(query(collection(db, "transactions"), where("pointsCalculated", "==", false))),
  ]);
  return { depositCount: deposits.data().count, issuedVoucherCount: claims.data().count, processingCount: processing.data().count };
}
