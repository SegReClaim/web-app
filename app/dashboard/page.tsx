"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Gift, Ticket, Leaf, ChevronRight, TrendingUp, QrCode } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageWrapper from "@/components/layout/PageWrapper";
import PointsBadge from "@/components/ui/PointsBadge";
import TransactionCard from "@/components/cards/TransactionCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import { getTransactions, getMachine } from "@/lib/firestore";
import { TransactionDoc, MachineDoc, WasteType } from "@/types";
import { formatWeight, calculateCO2, WASTE_COLORS, WASTE_LABELS } from "@/lib/utils";

const WASTE_TYPES: WasteType[] = ["plastic", "glass", "aluminium", "paper", "metal", "general"];

export default function DashboardPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [machines, setMachines] = useState<Record<string, MachineDoc>>({});
  const [txLoading, setTxLoading] = useState(true);
  const isNew = useRef(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setTxLoading(true);
      const txs = await getTransactions(user.uid, 5);
      setTransactions(txs);

      // Fetch machine locations for each unique machineId
      const uniqueMachineIds = [...new Set(txs.map((t) => t.machineId))];
      const machineMap: Record<string, MachineDoc> = {};
      await Promise.all(
        uniqueMachineIds.map(async (id) => {
          const m = await getMachine(id);
          if (m) machineMap[id] = m;
        })
      );
      setMachines(machineMap);
      setTxLoading(false);
    })();
  }, [user]);

  // Check if this is a first-time user (no transactions)
  useEffect(() => {
    if (userDoc && userDoc.lifetimePoints === 0) {
      isNew.current = true;
    }
  }, [userDoc]);

  // Impact stats
  const totalKg = (userDoc?.lifetimePoints ?? 0) > 0
    ? transactions.reduce((acc, t) => acc + t.totalWeightGrams, 0) / 1000
    : 0;

  // Per-waste-type weight
  const weightByType: Record<WasteType, number> = {
    plastic: 0, glass: 0, aluminium: 0, paper: 0, metal: 0, general: 0,
  };
  for (const tx of transactions) {
    for (const item of tx.items) {
      weightByType[item.wasteType] = (weightByType[item.wasteType] || 0) + item.weightGrams;
    }
  }
  const maxWeight = Math.max(...Object.values(weightByType), 1);

  if (loading || !userDoc) {
    return (
      <PageWrapper>
        <div className="space-y-4 mt-2">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-32" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-5">
        {/* Welcome banner for new users */}
        {isNew.current && (
          <div className="rounded-2xl bg-[#2D6A4F] text-white p-4 flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <p className="font-bold">Welcome to SegReClaim!</p>
              <p className="text-sm opacity-80 mt-0.5">
                Scan a QR code at any machine to start earning points.
              </p>
            </div>
          </div>
        )}

        {/* ── Points hero ─────────────────────────────── */}
        <div
          className="rounded-2xl bg-white p-5 relative overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
        >
          {/* Decorative circle */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#D8F3DC] opacity-60" />
          <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-[#74C69D] opacity-20" />

          <div className="relative">
            <p className="text-xs text-[#6B7F6E] font-medium mb-1">Your Balance</p>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-6xl font-extrabold tabular-nums text-[#1B2B1E] leading-none">
                {userDoc.totalPoints.toLocaleString()}
              </span>
              <span className="text-lg text-[#6B7F6E] mb-1">pts</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#D8F3DC] rounded-xl px-3 py-1.5">
                <Flame size={16} className="text-[#FF6B35]" />
                <span className="text-sm font-semibold text-[#1B2B1E]">
                  {userDoc.currentStreak} day streak
                </span>
              </div>
              <span className="text-xs text-[#6B7F6E]">
                Lifetime: {userDoc.lifetimePoints.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* ── Impact summary ───────────────────────────── */}
        <div
          className="rounded-2xl bg-white p-5"
          style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-[#2D6A4F]" />
            <h2 className="font-semibold text-[#1B2B1E] text-sm">Your Impact</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-[#D8F3DC] px-3 py-2.5">
              <p className="text-2xl font-extrabold text-[#2D6A4F]">
                {totalKg.toFixed(1)}
                <span className="text-sm font-medium ml-1">kg</span>
              </p>
              <p className="text-xs text-[#6B7F6E]">recycled</p>
            </div>
            <div className="rounded-xl bg-[#D8F3DC] px-3 py-2.5">
              <p className="text-2xl font-extrabold text-[#2D6A4F]">
                {calculateCO2(totalKg * 1000).toFixed(1)}
                <span className="text-sm font-medium ml-1">kg</span>
              </p>
              <p className="text-xs text-[#6B7F6E]">CO₂ saved</p>
            </div>
          </div>

          {/* Per-type bars */}
          <div className="space-y-2">
            {WASTE_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <span className="text-xs text-[#6B7F6E] w-16 flex-shrink-0">
                  {WASTE_LABELS[type]}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#D8F3DC] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(weightByType[type] / maxWeight) * 100}%`,
                      backgroundColor: WASTE_COLORS[type],
                    }}
                  />
                </div>
                <span className="text-xs text-[#6B7F6E] w-12 text-right flex-shrink-0">
                  {formatWeight(weightByType[type])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick actions ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Scan to Redeem — full-width top row */}
          <Link
            href="/redeem"
            className="col-span-2 flex items-center justify-between rounded-2xl
                       bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white px-5 py-4
                       hover:from-[#152e25] hover:to-[#255c44] active:scale-95 transition-all duration-150"
            style={{ boxShadow: "0 4px 20px rgba(45,106,79,0.3)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <QrCode size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-base">Scan to Redeem Credits</p>
                <p className="text-xs text-white/70 mt-0.5">
                  Got a QR code from the kiosk? Tap here to claim your credits.
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="opacity-60 flex-shrink-0 ml-2" />
          </Link>

          <Link
            href="/rewards"
            className="flex items-center justify-between rounded-2xl bg-[#2D6A4F] text-white px-4 py-4
                       hover:bg-[#1B4332] active:scale-95 transition-all duration-150"
            style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.2)" }}
          >
            <div>
              <Gift size={20} className="mb-2 opacity-80" />
              <p className="font-semibold text-sm">Claim Rewards</p>
              <p className="text-xs opacity-70 mt-0.5">Browse catalogue</p>
            </div>
            <ChevronRight size={18} className="opacity-60" />
          </Link>

          <Link
            href="/vouchers"
            className="flex items-center justify-between rounded-2xl border-2 border-[#2D6A4F] text-[#2D6A4F] px-4 py-4
                       hover:bg-[#D8F3DC] active:scale-95 transition-all duration-150"
          >
            <div>
              <Ticket size={20} className="mb-2 opacity-80" />
              <p className="font-semibold text-sm">My Vouchers</p>
              <p className="text-xs opacity-70 mt-0.5">View wallet</p>
            </div>
            <ChevronRight size={18} className="opacity-60" />
          </Link>
        </div>

        {/* ── Recent transactions ───────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#2D6A4F]" />
              <h2 className="font-semibold text-[#1B2B1E] text-sm">Recent Deposits</h2>
            </div>
          </div>

          {txLoading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No deposits yet"
              description="Start recycling to earn points! Scan the QR code at any SegReClaim machine to get started."
              ctaLabel="Find a Machine"
              onCta={() => router.push("/link")}
            />
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <TransactionCard
                  key={tx.transactionId}
                  transaction={tx}
                  machineLocation={machines[tx.machineId]?.locationName}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
