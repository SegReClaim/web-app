"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LogOut, Flame, Leaf, Recycle, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageWrapper from "@/components/layout/PageWrapper";
import SkeletonCard from "@/components/ui/SkeletonCard";
import { getTransactions } from "@/lib/firestore";
import { auth } from "@/lib/firebase";
import { TransactionDoc, WasteType } from "@/types";
import { calculateCO2, formatWeight, WASTE_LABELS, WASTE_COLORS } from "@/lib/utils";

const WASTE_TYPES: WasteType[] = ["plastic", "glass", "aluminium", "paper"];

export default function ProfilePage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionDoc[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const txs = await getTransactions(user.uid, 100);
      setTransactions(txs);
      setTxLoading(false);
    })();
  }, [user]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut(auth);
    router.replace("/login");
  }

  if (loading || !userDoc) {
    return (
      <PageWrapper>
        <SkeletonCard className="h-64 mt-2" />
      </PageWrapper>
    );
  }

  const totalWeightGrams = transactions.reduce((a, t) => a + t.totalWeightGrams, 0);
  const co2Saved = calculateCO2(totalWeightGrams);

  const weightByType: Record<WasteType, number> = {
    plastic: 0, glass: 0, aluminium: 0, paper: 0, metal: 0, general: 0,
  };
  for (const tx of transactions) {
    for (const item of tx.items) {
      weightByType[item.wasteType] = (weightByType[item.wasteType] || 0) + item.weightGrams;
    }
  }

  return (
    <PageWrapper>
      {/* Profile header */}
      <div
        className="rounded-2xl bg-white p-5 flex items-center gap-4 mb-5"
        style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#D8F3DC] flex items-center justify-center text-3xl flex-shrink-0">
          🌿
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1B2B1E] text-lg truncate">
            {userDoc.displayName || "Recycler"}
          </p>
          {userDoc.phone && (
            <p className="text-sm text-[#6B7F6E]">{userDoc.phone}</p>
          )}
          {user?.email && (
            <p className="text-sm text-[#6B7F6E] truncate">{user.email}</p>
          )}
        </div>
      </div>

      {/* Lifetime stats */}
      <div
        className="rounded-2xl bg-white p-5 mb-5"
        style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-[#2D6A4F]" />
          <h2 className="font-semibold text-[#1B2B1E] text-sm">Lifetime Stats</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Points Earned",
              value: userDoc.lifetimePoints.toLocaleString(),
              unit: "pts",
              icon: <Leaf size={16} className="text-[#2D6A4F]" />,
            },
            {
              label: "Recycled",
              value: (totalWeightGrams / 1000).toFixed(1),
              unit: "kg",
              icon: <Recycle size={16} className="text-[#74C69D]" />,
            },
            {
              label: "CO₂ Saved",
              value: co2Saved.toFixed(1),
              unit: "kg",
              icon: <span className="text-sm">🌍</span>,
            },
          ].map(({ label, value, unit, icon }) => (
            <div key={label} className="rounded-xl bg-[#D8F3DC] px-3 py-3 text-center">
              <div className="flex justify-center mb-1">{icon}</div>
              <p className="font-extrabold text-[#1B2B1E] text-lg leading-none">
                {txLoading ? "—" : value}
              </p>
              <p className="text-[10px] text-[#6B7F6E]">{unit}</p>
              <p className="text-[10px] text-[#6B7F6E] mt-1 leading-none">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Waste breakdown */}
      {!txLoading && totalWeightGrams > 0 && (
        <div
          className="rounded-2xl bg-white p-5 mb-5"
          style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Recycle size={16} className="text-[#2D6A4F]" />
            <h2 className="font-semibold text-[#1B2B1E] text-sm">By Waste Type</h2>
          </div>
          <div className="space-y-3">
            {WASTE_TYPES.filter((t) => weightByType[t] > 0).map((type) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs text-[#6B7F6E] w-20 flex-shrink-0">
                  {WASTE_LABELS[type]}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#D8F3DC] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(weightByType[type] / totalWeightGrams) * 100}%`,
                      backgroundColor: WASTE_COLORS[type],
                    }}
                  />
                </div>
                <span className="text-xs text-[#6B7F6E] w-14 text-right flex-shrink-0">
                  {formatWeight(weightByType[type])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak card */}
      <div
        className="rounded-2xl bg-white p-5 mb-5 flex items-center gap-4"
        style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-[#FF6B35]" />
            <h2 className="font-semibold text-[#1B2B1E] text-sm">Streak</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-3xl font-extrabold text-[#1B2B1E]">
                {userDoc.currentStreak}
              </p>
              <p className="text-xs text-[#6B7F6E]">Current streak</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#74C69D]">
                {userDoc.bestStreak}
              </p>
              <p className="text-xs text-[#6B7F6E]">Best streak</p>
            </div>
          </div>
        </div>
        <div className="text-5xl">🔥</div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200
                   text-red-500 font-semibold py-3 text-sm
                   hover:bg-red-50 active:scale-95 transition-all duration-150
                   disabled:opacity-50"
      >
        <LogOut size={16} />
        {signingOut ? "Signing out…" : "Sign Out"}
      </button>
    </PageWrapper>
  );
}
