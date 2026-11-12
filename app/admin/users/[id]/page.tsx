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
  ShieldCheck,
} from "lucide-react";
import {
  getUserAdmin,
  setUserRole,
} from "@/lib/admin-firestore";
import { useAuth } from "@/context/AuthContext";
import { friendlyError } from "@/lib/utils";
import { UserDoc, UserRole } from "@/types";
import ActivityHistory from "@/components/admin/ActivityHistory";
import SkeletonCard from "@/components/ui/SkeletonCard";

function formatDate(ts?: { toDate: () => Date } | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user: authUser, isSuperAdmin } = useAuth();
  const [user, setUser] = useState<UserDoc | null>(null);
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
    let cancelled = false;
    getUserAdmin(id)
      .then((profile) => {
        if (cancelled) return;
        if (!profile) { router.replace("/admin/users"); return; }
        setUser(profile);
      })
      .catch((e) => { if (!cancelled) setError(friendlyError(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, router]);

  if (loading) {
    return <div className="space-y-4"><SkeletonCard className="h-40" /><SkeletonCard className="h-64" /></div>;
  }
  if (!user) {
    return <div role="alert" className="space-y-3 text-sm text-[#526657]">
      <p>{error || "This user could not be found."}</p>
      <Link href="/admin/users" className="font-semibold text-[#2D6A4F]">Back to users</Link>
    </div>;
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

      <section className="space-y-3">
        <ActivityHistory key={id} mode="transactions" userId={id} />
      </section>
    </div>
  );
}
