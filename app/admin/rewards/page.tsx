"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Gift } from "lucide-react";
import { getAllRewardsAdmin, getAllPartners } from "@/lib/admin-firestore";
import { RewardDoc, PartnerDoc } from "@/types";
import { getClaimLimitLabel } from "@/lib/firestore";
import SkeletonCard from "@/components/ui/SkeletonCard";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<RewardDoc[]>([]);
  const [partners, setPartners] = useState<Record<string, PartnerDoc>>({});
  const [loading, setLoading] = useState(true);
  const [filterPartner, setFilterPartner] = useState("");

  useEffect(() => {
    Promise.all([getAllRewardsAdmin(), getAllPartners()])
      .then(([r, p]) => {
        setRewards(r);
        const map: Record<string, PartnerDoc> = {};
        p.forEach((x) => (map[x.partnerId] = x));
        setPartners(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterPartner
    ? rewards.filter((r) => r.partnerId === filterPartner)
    : rewards;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B1E]">Rewards</h1>
          <p className="text-sm text-[#6B7F6E] mt-1">
            Points pricing, stock, claim limits, and brand collabs
          </p>
        </div>
        <Link
          href="/admin/rewards/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#1B4332]"
        >
          <Plus size={16} />
          New reward
        </Link>
      </div>

      <select
        value={filterPartner}
        onChange={(e) => setFilterPartner(e.target.value)}
        className="rounded-xl border border-[#D8F3DC] bg-white px-3 py-2 text-sm text-[#1B2B1E]"
      >
        <option value="">All partners</option>
        {Object.values(partners).map((p) => (
          <option key={p.partnerId} value={p.partnerId}>
            {p.name}
          </option>
        ))}
      </select>

      {loading ? (
        <SkeletonCard className="h-32" />
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-10 text-center"
          style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
        >
          <Gift size={40} className="mx-auto text-[#74C69D] mb-3" />
          <p className="font-semibold text-[#1B2B1E]">No rewards yet</p>
          <Link
            href="/admin/rewards/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2D6A4F] mt-3"
          >
            <Plus size={16} /> Create reward
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white" style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D8F3DC] text-left text-xs text-[#6B7F6E] uppercase tracking-wider">
                <th className="p-4 font-semibold">Reward</th>
                <th className="p-4 font-semibold hidden md:table-cell">Partner</th>
                <th className="p-4 font-semibold">Points</th>
                <th className="p-4 font-semibold hidden sm:table-cell">Worth</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Stock</th>
                <th className="p-4 font-semibold hidden lg:table-cell">Limit</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.rewardId} className="border-b border-[#F8F4EF] last:border-0 hover:bg-[#F8F4EF]/50">
                  <td className="p-4">
                    <p className="font-medium text-[#1B2B1E]">{r.title}</p>
                    {r.brandName && (
                      <p className="text-xs text-[#2D6A4F]">by {r.brandName}</p>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell text-[#6B7F6E]">
                    {partners[r.partnerId]?.name ?? r.partnerId}
                  </td>
                  <td className="p-4 font-semibold text-[#2D6A4F]">{r.pointsCost}</td>
                  <td className="p-4 hidden sm:table-cell text-[#6B7F6E]">
                    {r.rupeeValue ? `₹${r.rupeeValue}` : "—"}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-[#6B7F6E]">
                    {r.stockMode === "unlimited"
                      ? "∞"
                      : `${r.remaining ?? 0}/${r.totalStock ?? 0}`}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-xs text-[#6B7F6E]">
                    {getClaimLimitLabel(r.claimLimitMode, r.maxClaimsPerUser)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        r.active
                          ? "bg-[#D8F3DC] text-[#2D6A4F]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/rewards/${r.rewardId}?partnerId=${r.partnerId}`}
                      className="text-[#2D6A4F] hover:text-[#1B4332]"
                    >
                      <Pencil size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
