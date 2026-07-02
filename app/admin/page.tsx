"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Gift,
  AlertTriangle,
  TrendingUp,
  Plus,
  Users,
  ChevronRight,
} from "lucide-react";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { getAdminStats, getRecentUsers } from "@/lib/admin-firestore";
import { friendlyError } from "@/lib/utils";
import { UserDoc } from "@/types";

function formatDate(ts?: { toDate: () => Date } | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminStats(), getRecentUsers(5)])
      .then(([s, u]) => {
        setStats(s);
        setRecentUsers(u);
      })
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#1B2B1E]">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
        <SkeletonCard className="h-48" />
      </div>
    );
  }

  const cards = [
    { label: "Users", value: stats?.userCount ?? 0, sub: "registered", icon: Users, href: "/admin/users" },
    { label: "Partners", value: stats?.partnerCount ?? 0, sub: `${stats?.activePartnerCount ?? 0} active`, icon: Store, href: "/admin/partners" },
    { label: "Rewards", value: stats?.rewardCount ?? 0, sub: `${stats?.activeRewardCount ?? 0} live`, icon: Gift, href: "/admin/rewards" },
    { label: "Total claims", value: stats?.claimCount ?? 0, sub: "all time", icon: TrendingUp },
    { label: "Low stock", value: stats?.lowStockCount ?? 0, sub: "under 5 left", icon: AlertTriangle, warn: (stats?.lowStockCount ?? 0) > 0, href: "/admin/rewards" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B1E]">Dashboard</h1>
          <p className="text-sm text-[#6B7F6E] mt-1">
            Overview of users, partners, rewards, and claims
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/rewards/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#1B4332] transition-colors"
          >
            <Plus size={16} />
            New reward
          </Link>
          <Link
            href="/admin/partners/new"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#2D6A4F] text-[#2D6A4F] px-4 py-2.5 text-sm font-semibold hover:bg-[#D8F3DC] transition-colors"
          >
            <Plus size={16} />
            New partner
          </Link>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, warn, href }) => {
          const card = (
            <div
              className={`rounded-2xl bg-white p-4 h-full ${href ? "hover:bg-[#F8F4EF] transition-colors" : ""}`}
              style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={warn ? "text-[#FB8500]" : "text-[#2D6A4F]"} />
              </div>
              <p className={`text-2xl font-extrabold tabular-nums ${warn ? "text-[#FB8500]" : "text-[#1B2B1E]"}`}>
                {value}
              </p>
              <p className="text-xs text-[#6B7F6E]">{label}</p>
              <p className="text-[10px] text-[#74C69D] mt-0.5">{sub}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      {/* Recent signups */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#1B2B1E]">Recent signups</h2>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2D6A4F] hover:text-[#1B4332]"
          >
            View all <ChevronRight size={15} />
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-[#6B7F6E]">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <Link
                key={u.uid}
                href={`/admin/users/${u.uid}`}
                className="rounded-xl bg-white px-4 py-3 flex items-center gap-3 hover:bg-[#F8F4EF] transition-colors"
                style={{ boxShadow: "0 1px 6px rgba(45,106,79,0.06)" }}
              >
                {u.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover bg-[#D8F3DC]"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#D8F3DC] flex items-center justify-center text-sm font-bold text-[#2D6A4F]">
                    {(u.displayName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2B1E] truncate">
                    {u.displayName || "Unnamed"}
                  </p>
                  <p className="text-xs text-[#6B7F6E] truncate">
                    {u.email || u.phone || u.uid}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#2D6A4F] tabular-nums">
                    {u.totalPoints ?? 0} pts
                  </p>
                  <p className="text-[10px] text-[#6B7F6E]">{formatDate(u.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
