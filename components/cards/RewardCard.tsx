"use client";

import { useState } from "react";
import { ShoppingBag, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { RewardCatalogueItem } from "@/types";
import { claimVoucherFn } from "@/lib/firebase";
import { friendlyError } from "@/lib/utils";

interface RewardCardProps {
  item: RewardCatalogueItem;
  index: number;
  partnerId: string;
  partnerName: string;
  userPoints: number;
  onClaimed: () => void;
}

export default function RewardCard({
  item,
  index,
  partnerId,
  partnerName,
  userPoints,
  onClaimed,
}: RewardCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const canAfford = userPoints >= item.pointsCost;
  const outOfStock = item.remaining <= 0;
  const stockPct = Math.round((item.remaining / Math.max(item.totalStock, 1)) * 100);

  async function handleClaim() {
    setLoading(true);
    setError(null);
    try {
      await claimVoucherFn({ partnerId, catalogueIndex: index });
      setClaimed(true);
      setTimeout(() => onClaimed(), 1200);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  if (claimed) {
    return (
      <div className="rounded-xl bg-[#D8F3DC] border border-[#74C69D] px-4 py-3 flex items-center gap-3">
        <Sparkles size={20} className="text-[#2D6A4F] animate-bounce" />
        <div>
          <p className="font-semibold text-[#2D6A4F] text-sm">Voucher claimed! 🎉</p>
          <p className="text-xs text-[#6B7F6E]">Redirecting to your vouchers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#D8F3DC] bg-[#F8F4EF] px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[#1B2B1E] font-medium leading-snug flex-1">
          {item.description}
        </p>
        <span className="text-[#2D6A4F] font-bold text-sm flex-shrink-0">
          {item.pointsCost.toLocaleString()} pts
        </span>
      </div>

      {/* Stock bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[#6B7F6E]">
          <span>{item.remaining} remaining</span>
          <span className={outOfStock ? "text-red-500" : stockPct < 20 ? "text-[#FB8500]" : "text-[#74C69D]"}>
            {outOfStock ? "Out of stock" : stockPct < 20 ? "Almost gone!" : "Available"}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#D8F3DC] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${stockPct}%`,
              backgroundColor: stockPct < 20 ? "#FB8500" : "#74C69D",
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={!canAfford || outOfStock || loading}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold
                    active:scale-95 transition-all duration-150
                    ${
                      canAfford && !outOfStock
                        ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                        : "bg-[#D8F3DC] text-[#6B7F6E] cursor-not-allowed"
                    }
                    disabled:opacity-70`}
      >
        {loading ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <ShoppingBag size={16} />
        )}
        {loading
          ? "Claiming…"
          : outOfStock
          ? "Out of Stock"
          : !canAfford
          ? `Need ${(item.pointsCost - userPoints).toLocaleString()} more pts`
          : "Claim Reward"}
      </button>
    </div>
  );
}
