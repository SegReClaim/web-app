"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  Flame,
  Coins,
  Recycle,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import {
  getUserAdmin,
  getUserTransactionsAdmin,
  getUserVouchersAdmin,
  setUserRole,
} from "@/lib/admin-firestore";
import { useAuth } from "@/context/AuthContext";
import { friendlyError } from "@/lib/utils";
import { UserDoc, UserRole, TransactionDoc, VoucherDoc } from "@/types";
import SkeletonCard from "@/components/ui/SkeletonCard";

function formatDate(ts?: { toDate: () => Date } | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(ts?: { toDate: () => Date } | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const voucherStatusStyles: Record<string, string> = {
  active: "bg-[#D8F3DC] text-[#2D6A4F]",
  redeemed: "bg-blue-50 text-blue-600",
  expired: "bg-gray-100 text-gray-500",
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user: authUser, isSuperAdmin } = useAuth();
  const [user, setUser] = useState<UserDoc | null>(null);
  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [vouchers, setVouchers] = useState<VoucherDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleSaving, setRoleSaving] = useState(false);

  async function changeRole(role: UserRole) {
    if (!user) return;
    setRoleSaving(true);
    setError(null);
    try {
      await setUserRole(user.uid, role);
      setUser({ ...user, role });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setRoleSaving(false);
    }
  }

  useEffect(() => {
    Promise.all([
      getUserAdmin(id),
      getUserTransactionsAdmin(id),
      getUserVouchersAdmin(id),
    ])
      .then(([u, txs, vs]) => {
        if (!u) {
          router.replace("/admin/users");
          return;
        }
        setUser(u);
        setTransactions(txs);
        setVouchers(vs);
      })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !user) {
    return (
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  const stats = [
    { label: "Points balance", value: user.totalPoints ?? 0, icon: Coins },
    { label: "Lifetime points", value: user.lifetimePoints ?? 0, icon: Recycle },
    { label: "Current streak", value: user.currentStreak ?? 0, icon: Flame },
    { label: "Best streak", value: user.bestStreak ?? 0, icon: Flame },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-[#6B7F6E] hover:text-[#2D6A4F]"
      >
        <ChevronLeft size={16} /> Back to users
      </Link>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      {/* Profile card */}
      <div
        className="rounded-2xl bg-white p-5"
        style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
      >
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover bg-[#D8F3DC]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#D8F3DC] flex items-center justify-center text-2xl font-bold text-[#2D6A4F]">
              {(user.displayName || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#1B2B1E] flex items-center gap-2">
              <span className="truncate">{user.displayName || "Unnamed"}</span>
              {user.role === "superadmin" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-[#1B4332] text-[#D8F3DC] px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Superadmin
                </span>
              )}
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-full">
                  <ShieldCheck size={12} /> Admin
                </span>
              )}
            </h1>
            <p className="text-xs text-[#6B7F6E] font-mono truncate">{user.uid}</p>
          </div>
          {isSuperAdmin &&
            user.uid !== authUser?.uid &&
            user.role !== "superadmin" && (
              <div className="ml-auto shrink-0">
                {user.role === "admin" ? (
                  <button
                    type="button"
                    disabled={roleSaving}
                    onClick={() => changeRole("user")}
                    className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    {roleSaving ? "Saving…" : "Remove admin"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={roleSaving}
                    onClick={() => changeRole("admin")}
                    className="text-sm font-semibold px-4 py-2 rounded-xl border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#D8F3DC] transition-colors disabled:opacity-60"
                  >
                    {roleSaving ? "Saving…" : "Make admin"}
                  </button>
                )}
              </div>
            )}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-[#1B2B1E]">
          <p className="flex items-center gap-2 min-w-0">
            <Mail size={15} className="shrink-0 text-[#2D6A4F]" />
            <span className="truncate">{user.email || "No email"}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone size={15} className="shrink-0 text-[#2D6A4F]" />
            {user.phone || "No phone"}
          </p>
          <p className="flex items-center gap-2">
            <Calendar size={15} className="shrink-0 text-[#2D6A4F]" />
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl bg-white p-4"
            style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
          >
            <Icon size={18} className="text-[#2D6A4F] mb-2" />
            <p className="text-2xl font-extrabold tabular-nums text-[#1B2B1E]">
              {value}
            </p>
            <p className="text-xs text-[#6B7F6E]">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent deposits */}
      <section>
        <h2 className="font-semibold text-[#1B2B1E] mb-3 flex items-center gap-2">
          <Recycle size={17} className="text-[#2D6A4F]" /> Recent deposits
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-[#6B7F6E]">No deposits yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div
                key={t.transactionId}
                className="rounded-xl bg-white px-4 py-3 flex items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 6px rgba(45,106,79,0.06)" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1B2B1E]">
                    {t.items?.map((i) => i.wasteType).join(", ") || "Deposit"}
                    <span className="text-[#6B7F6E] font-normal">
                      {" "}· {((t.totalWeightGrams ?? 0) / 1000).toFixed(2)} kg
                    </span>
                  </p>
                  <p className="text-xs text-[#6B7F6E]">
                    {formatDateTime(t.createdAt)} · {t.machineId}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#2D6A4F] tabular-nums shrink-0">
                  +{t.totalPoints} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vouchers */}
      <section>
        <h2 className="font-semibold text-[#1B2B1E] mb-3 flex items-center gap-2">
          <Ticket size={17} className="text-[#2D6A4F]" /> Vouchers claimed
        </h2>
        {vouchers.length === 0 ? (
          <p className="text-sm text-[#6B7F6E]">No vouchers claimed yet.</p>
        ) : (
          <div className="space-y-2">
            {vouchers.map((v) => (
              <div
                key={v.voucherId}
                className="rounded-xl bg-white px-4 py-3 flex items-center justify-between gap-3"
                style={{ boxShadow: "0 1px 6px rgba(45,106,79,0.06)" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1B2B1E] truncate">
                    {v.description}
                  </p>
                  <p className="text-xs text-[#6B7F6E]">
                    {v.partnerName || v.partnerId} · {formatDateTime(v.createdAt)} ·{" "}
                    <span className="font-mono">{v.code}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-[#1B2B1E] tabular-nums">
                    −{v.pointsSpent} pts
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      voucherStatusStyles[v.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
