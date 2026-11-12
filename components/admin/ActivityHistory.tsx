"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Gift, History, LoaderCircle, Recycle, RefreshCw, Search } from "lucide-react";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { getActivityPage, type ActivityCursor, type AdminActivityRecord } from "@/lib/admin-activity";
import { formatDateTime, formatWeight, friendlyError } from "@/lib/utils";

type ActivityMode = "transactions" | "deposits" | "claims";

const copy = {
  transactions: { title: "Transaction history", description: "Follow waste deposits and reward claims in one place.", empty: "No transactions yet", detail: "Deposits and reward claims will appear here as users earn and spend points." },
  deposits: { title: "Waste deposits", description: "Review deposited materials, weights, machines, and points earned.", empty: "No waste deposits yet", detail: "Deposits will appear here after users recycle at a machine." },
  claims: { title: "Reward claims", description: "Review claimed rewards, points spent, and voucher status.", empty: "No reward claims yet", detail: "Claims will appear here when users redeem their points for rewards." },
};

const fieldClass = "w-full min-w-0 rounded-xl border-2 border-[#D8F3DC] bg-white px-3 py-2.5 text-sm text-[#1B2B1E] placeholder:text-[#526657] focus:border-[#2D6A4F] focus:outline-none";
const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#2D6A4F] hover:bg-[#D8F3DC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D6A4F] disabled:cursor-wait disabled:opacity-60 transition-colors";

function label(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function pointsLabel(points: number | null) {
  if (points === null) return "Points pending";
  return `${points > 0 ? "+" : ""}${points.toLocaleString("en-IN")} pts`;
}

function statusClass(status: string) {
  if (["failed", "cancelled", "expired", "rejected"].includes(status)) return "bg-red-50 text-red-800";
  if (["pending", "processing", "unresolved"].includes(status)) return "bg-amber-50 text-amber-900";
  return "bg-[#D8F3DC] text-[#1B4332]";
}

function ActivityRow({ record, embedded }: { record: AdminActivityRecord; embedded: boolean }) {
  const deposit = record.kind === "deposit";
  const Icon = deposit ? Recycle : Gift;

  return (
    <details className="group bg-white first:rounded-t-2xl last:rounded-b-2xl">
      <summary className="flex min-w-0 cursor-pointer list-none items-start gap-3 rounded-2xl p-4 hover:bg-[#F0F7F1] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2D6A4F] [&::-webkit-details-marker]:hidden sm:items-center sm:p-5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${deposit ? "bg-[#D8F3DC] text-[#2D6A4F]" : "bg-[#FFF5E5] text-[#935100]"}`}>
          <Icon size={19} aria-hidden="true" />
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 sm:grid-cols-[minmax(0,1fr)_9rem_8rem] sm:items-center">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-[#1B2B1E]">{record.title}</p>
            <p className="mt-0.5 break-words text-xs text-[#526657]">
              {deposit ? "Waste deposit" : "Reward claim"}
              {!embedded && ` · ${record.userName}`}
              {deposit && ` · ${formatWeight(record.weightGrams)}`}
            </p>
          </div>
          <span className={`col-start-2 row-start-1 text-right text-sm font-bold tabular-nums sm:col-start-3 ${deposit ? "text-[#2D6A4F]" : "text-[#935100]"}`}>
            {pointsLabel(record.points)}
          </span>
          <span className="col-start-1 text-xs text-[#526657] sm:col-start-2 sm:row-start-1 sm:text-right">
            {record.timestamp ? formatDateTime(record.timestamp) : "Date unavailable"}
          </span>
          <span className="col-start-2 row-start-2 text-right sm:col-start-3">
            <span className={`inline-flex max-w-full break-words rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(record.status)}`}>{label(record.status)}</span>
          </span>
        </div>
        <ChevronDown size={17} aria-hidden="true" className="mt-1 shrink-0 text-[#526657] transition-transform group-open:rotate-180 motion-reduce:transition-none sm:mt-0" />
        <span className="sr-only">Transaction details</span>
      </summary>
      <div className="border-t border-[#E4EDE5] px-4 pb-5 pt-4 sm:px-5">
        <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-xs text-[#526657]">User</dt>
            <dd className="mt-1 break-words font-medium text-[#1B2B1E]">
              {record.userId ? (
                <Link href={`/admin/users/${encodeURIComponent(record.userId)}`} className="inline-flex items-center gap-1 rounded text-[#2D6A4F] underline decoration-[#B7D9C2] underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2D6A4F]">
                  {record.userName}<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">, view user history</span>
                </Link>
              ) : record.userName}
              {record.userContact && <span className="mt-1 block break-all text-xs font-normal text-[#526657]">{record.userContact}</span>}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-[#526657]">{deposit ? "Machine" : "Partner"}</dt>
            <dd className="mt-1 break-words font-medium text-[#1B2B1E]">{deposit ? record.machineName || record.machineId || "Not recorded" : record.partnerName || "Not recorded"}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-[#526657]">Reference</dt>
            <dd className="mt-1 break-all text-[#1B2B1E]">{record.reference || record.id}</dd>
          </div>
          {!deposit && (
            <>
              <div className="min-w-0"><dt className="text-xs text-[#526657]">Voucher code</dt><dd className="mt-1 break-all font-medium text-[#1B2B1E]">{record.voucherCode || "Not available"}</dd></div>
              <div><dt className="text-xs text-[#526657]">Voucher expiry</dt><dd className="mt-1 text-[#1B2B1E]">{record.expiresAt ? formatDateTime(record.expiresAt) : "Not recorded"}</dd></div>
            </>
          )}
        </dl>
        {deposit && (
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-[#526657]">Deposited materials</h3>
            {record.items.length > 0 ? (
              <ul className="mt-2 divide-y divide-[#E4EDE5]">
                {record.items.map((item, index) => (
                  <li key={`${item.wasteType}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="font-medium text-[#1B2B1E]">{label(item.wasteType)}</span>
                    <span className="flex items-center gap-4 text-[#526657] tabular-nums"><span>{formatWeight(item.weightGrams)}</span><span>{pointsLabel(item.pointsEarned)}</span></span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-[#526657]">No material breakdown recorded.</p>}
          </div>
        )}
      </div>
    </details>
  );
}

export default function ActivityHistory({ mode = "transactions", userId, headingLevel, compact = false }: { mode?: ActivityMode; userId?: string; headingLevel?: 1 | 2; compact?: boolean }) {
  const prefix = useId();
  const [records, setRecords] = useState<AdminActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [material, setMaterial] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const cursor = useRef<ActivityCursor | null>(null);
  const request = useRef(0);
  const busy = useRef(false);
  const failedAppend = useRef(false);
  const content = copy[mode];

  const load = useCallback(async (append = false) => {
    if (busy.current) return;
    busy.current = true;
    const current = ++request.current;
    failedAppend.current = append;
    setLoading(true);
    setError(null);
    if (!append) {
      cursor.current = null;
      setRecords([]);
      setHasMore(false);
    }
    try {
      const result = await getActivityPage(mode, { cursor: append ? cursor.current : undefined, pageSize: compact ? 6 : 30, userId });
      if (current !== request.current) return;
      setRecords((previous) => {
        if (!append) return result.records;
        const seen = new Set(previous.map((record) => `${record.kind}:${record.id}`));
        return [...previous, ...result.records.filter((record) => !seen.has(`${record.kind}:${record.id}`))];
      });
      cursor.current = result.cursor;
      setHasMore(result.hasMore);
    } catch (cause) {
      if (current === request.current) setError(friendlyError(cause));
    } finally {
      if (current === request.current) {
        setLoading(false);
        busy.current = false;
      }
    }
  }, [mode, userId, compact]);

  useEffect(() => {
    busy.current = false;
    void load();
    return () => { request.current += 1; };
  }, [load]);

  const materials = useMemo(() => [...new Set([...records.flatMap((record) => record.materials), ...(material ? [material] : [])])].sort(), [records, material]);
  const statuses = useMemo(() => [...new Set([...records.map((record) => record.status), ...(status ? [status] : [])])].sort(), [records, status]);
  const invalidRange = Boolean(from && to && from > to);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const start = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const end = to ? new Date(`${to}T23:59:59.999`).getTime() : null;
    return records.filter((record) => {
      if (invalidRange) return false;
      if (kind && record.kind !== kind) return false;
      if (material && !record.materials.includes(material)) return false;
      if (status && record.status !== status) return false;
      const time = record.timestamp?.toMillis();
      if (start !== null && (time === undefined || time < start)) return false;
      if (end !== null && (time === undefined || time > end)) return false;
      if (!term) return true;
      return [record.title, record.userName, record.userContact, record.userId, record.machineName, record.machineId, record.partnerName, record.reference, record.voucherCode, ...record.materials].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [records, search, material, status, kind, from, to, invalidRange]);
  const totals = useMemo(() => filtered.reduce((sum, record) => ({
    weight: sum.weight + record.weightGrams,
    earned: sum.earned + (record.kind === "deposit" ? record.points ?? 0 : 0),
    spent: sum.spent + (record.kind === "claim" ? Math.abs(record.points ?? 0) : 0),
  }), { weight: 0, earned: 0, spent: 0 }), [filtered]);
  const hasFilters = Boolean(search || material || status || kind || from || to);
  function clearFilters() { setSearch(""); setMaterial(""); setStatus(""); setKind(""); setFrom(""); setTo(""); }
  const Heading = userId || headingLevel === 2 ? "h2" : "h1";

  return (
    <section className="space-y-5 selection:bg-[#D8F3DC] selection:text-[#1B4332]" aria-labelledby={`${prefix}-heading`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading id={`${prefix}-heading`} className={`${userId || compact ? "text-xl" : "text-2xl"} font-bold text-[#1B2B1E]`}>{compact ? "Recent activity" : userId ? "User activity history" : content.title}</Heading>
          <p className="mt-1 max-w-prose text-sm text-[#526657]">{content.description}</p>
        </div>
        {compact ? <Link href="/admin/transactions" className={buttonClass}>View all activity<ArrowUpRight size={16} aria-hidden="true" /></Link> : <button type="button" onClick={() => void load()} disabled={loading} className={`${buttonClass} bg-white`}><RefreshCw size={16} aria-hidden="true" />Refresh</button>}
      </div>

      {!compact && <div className="rounded-2xl bg-white p-4 sm:p-5" style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-[#526657]">Search loaded records</span>
            <span className="relative block"><Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526657]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="User, reference, machine, or reward" className={`${fieldClass} pl-9`} /></span>
          </label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#526657]">Status</span><select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
          {mode === "transactions" ? <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#526657]">Activity type</span><select aria-label="Activity type" value={kind} onChange={(event) => setKind(event.target.value)} className={fieldClass}><option value="">All activity</option><option value="deposit">Waste deposits</option><option value="claim">Reward claims</option></select></label> : mode === "deposits" ? <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#526657]">Material</span><select aria-label="Material" value={material} onChange={(event) => setMaterial(event.target.value)} className={fieldClass}><option value="">All materials</option>{materials.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label> : null}
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#526657]">From date</span><input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} aria-invalid={invalidRange} aria-describedby={invalidRange ? `${prefix}-date-error` : undefined} className={fieldClass} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#526657]">To date</span><input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} aria-invalid={invalidRange} aria-describedby={invalidRange ? `${prefix}-date-error` : undefined} className={fieldClass} /></label>
          {mode === "transactions" && <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#526657]">Material</span><select aria-label="Material" value={material} onChange={(event) => setMaterial(event.target.value)} className={fieldClass}><option value="">All materials</option>{materials.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>}
          {hasFilters && <div className="flex items-end"><button type="button" onClick={clearFilters} className={buttonClass}>Clear filters</button></div>}
        </div>
        {invalidRange && <p id={`${prefix}-date-error`} role="alert" className="mt-3 text-sm text-red-700">Choose an end date on or after the start date.</p>}
        <p className="mt-4 text-xs leading-relaxed text-[#526657]">Search, filters, and totals apply to loaded records. Load more to include earlier activity. Dates use your local time.</p>
      </div>}

      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3"><div className="min-w-0"><p className="text-sm font-semibold text-red-800">Could not load {failedAppend.current ? "more activity" : "activity"}</p><p className="mt-1 break-words text-sm text-red-700">{error}</p></div><button type="button" onClick={() => void load(failedAppend.current)} disabled={loading} className={`${buttonClass} text-red-800 hover:bg-red-100`}>Try again</button></div>}

      <div aria-busy={loading}>
        {loading && records.length === 0 ? <div role="status" className="space-y-3"><span className="sr-only">Loading activity</span><SkeletonCard className="h-24" /><SkeletonCard className="h-24" /><SkeletonCard className="h-24" /></div> : (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-sm text-[#526657]" aria-live="polite">
              <p className="font-medium text-[#1B2B1E]">{compact ? `Latest ${records.length} records` : `${filtered.length.toLocaleString("en-IN")} matching of ${records.length.toLocaleString("en-IN")} loaded`}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs tabular-nums">
                {mode !== "claims" && <span>{formatWeight(totals.weight)} deposited</span>}
                {mode !== "claims" && <span>{totals.earned.toLocaleString("en-IN")} pts earned</span>}
                {mode !== "deposits" && <span>{totals.spent.toLocaleString("en-IN")} pts spent</span>}
              </div>
            </div>
            {filtered.length > 0 ? <div className="divide-y divide-[#E4EDE5] rounded-2xl" style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}>{filtered.map((record) => <ActivityRow key={`${record.kind}:${record.id}`} record={record} embedded={Boolean(userId)} />)}</div> : !error && (
              <div className="rounded-2xl bg-white px-5 py-12 text-center" style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}>
                <History size={32} aria-hidden="true" className="mx-auto mb-3 text-[#2D6A4F]" />
                <p className="font-semibold text-[#1B2B1E]">{hasFilters ? "No loaded records match these filters" : content.empty}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-[#526657]">{hasFilters ? "Try a different search or date range. Earlier activity may be available by loading more." : content.detail}</p>
                {hasFilters && <button type="button" onClick={clearFilters} className={`${buttonClass} mt-4`}>Clear filters</button>}
              </div>
            )}
            {!compact && hasMore && <div className="mt-5 flex justify-center"><button type="button" onClick={() => void load(true)} disabled={loading} className={`${buttonClass} bg-[#2D6A4F] text-white hover:bg-[#1B4332]`}>{loading && <LoaderCircle size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}{loading ? "Loading more…" : "Load more activity"}</button></div>}
            {!compact && !hasMore && records.length > 0 && <p className="mt-4 text-center text-xs text-[#526657]">All available records loaded.</p>}
          </>
        )}
      </div>
    </section>
  );
}
