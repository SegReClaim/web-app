"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Users, Search, ChevronRight, ShieldCheck } from "lucide-react";
import { getAllUsers } from "@/lib/admin-firestore";
import { friendlyError } from "@/lib/utils";
import { UserDoc } from "@/types";
import SkeletonCard from "@/components/ui/SkeletonCard";

function formatDate(ts?: { toDate: () => Date } | null): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((e) => setError(friendlyError(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term) ||
        u.uid.toLowerCase().includes(term)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B1E]">Users</h1>
          <p className="text-sm text-[#6B7F6E] mt-1">
            {loading ? "Loading…" : `${users.length} registered user${users.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7F6E]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-full sm:w-72 rounded-xl border-2 border-[#D8F3DC] bg-white pl-9 pr-3 py-2.5 text-sm
                       focus:border-[#74C69D] focus:outline-none placeholder:text-[#6B7F6E]/60"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-10 text-center"
          style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
        >
          <Users size={40} className="mx-auto text-[#74C69D] mb-3" />
          <p className="font-semibold text-[#1B2B1E]">
            {search ? "No users match your search" : "No users yet"}
          </p>
          <p className="text-sm text-[#6B7F6E] mt-1">
            {search
              ? "Try a different name, email, or phone number."
              : "Users appear here after their first sign-in."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <Link
              key={u.uid}
              href={`/admin/users/${u.uid}`}
              className="rounded-2xl bg-white p-4 flex items-center gap-4 hover:bg-[#F8F4EF] transition-colors"
              style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
            >
              {u.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover bg-[#D8F3DC]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#D8F3DC] flex items-center justify-center text-lg font-bold text-[#2D6A4F]">
                  {(u.displayName || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1B2B1E] flex items-center gap-1.5">
                  <span className="truncate">{u.displayName || "Unnamed"}</span>
                  {u.role === "superadmin" && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-[#1B4332] text-[#D8F3DC] px-2 py-0.5 rounded-full">
                      <ShieldCheck size={11} /> Superadmin
                    </span>
                  )}
                  {u.role === "admin" && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-[#D8F3DC] text-[#2D6A4F] px-2 py-0.5 rounded-full">
                      <ShieldCheck size={11} /> Admin
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#6B7F6E] truncate">
                  {u.email || u.phone || "No email"}
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-[#2D6A4F] tabular-nums">
                  {u.totalPoints ?? 0} pts
                </p>
                <p className="text-[10px] text-[#6B7F6E]">
                  joined {formatDate(u.createdAt)}
                </p>
              </div>
              <ChevronRight size={18} className="text-[#6B7F6E] shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
