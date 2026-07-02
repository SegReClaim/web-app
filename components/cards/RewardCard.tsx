"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { RewardDoc } from "@/types";
import { claimVoucherFn } from "@/lib/firebase";
import { getUserRewardClaimCount, getClaimLimitLabel } from "@/lib/firestore";
import { friendlyError } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface RewardCardProps {
  reward: RewardDoc;
  partnerName: string;
  userPoints: number;
  onClaimed: () => void;
}

export default function RewardCard({
  reward,
  partnerName,
  userPoints,
  onClaimed,
}: RewardCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [userClaims, setUserClaims] = useState<number | null>(null);

  const isLegacy = reward.rewardId.startsWith("legacy-");
  const outOfStock =
    reward.stockMode === "limited" && (reward.remaining ?? 0) <= 0;
  const canAfford = userPoints >= reward.pointsCost;
  const stockPct =
    reward.stockMode === "limited"
      ? Math.round(
          ((reward.remaining ?? 0) / Math.max(reward.totalStock ?? 1, 1)) * 100
        )
      : 100;

  const maxClaims =
    reward.claimLimitMode === "unlimited"
      ? null
      : reward.claimLimitMode === "once"
      ? 1
      : reward.maxClaimsPerUser ?? 1;

  const claimsExhausted =
    maxClaims !== null && userClaims !== null && userClaims >= maxClaims;

  useEffect(() => {
    if (!user || isLegacy || maxClaims === null) {
      setUserClaims(null);
      return;
    }
    getUserRewardClaimCount(user.uid, reward.rewardId).then(setUserClaims);
  }, [user, reward.rewardId, isLegacy, maxClaims]);

  async function handleClaim() {
    setLoading(true);
    setError(null);
    try {
      if (isLegacy) {
        const parts = reward.rewardId.split("-");
        const catalogueIndex = Number(parts[parts.length - 1]);
        await claimVoucherFn({
          partnerId: reward.partnerId,
          catalogueIndex,
        });
      } else {
        await claimVoucherFn({
          rewardId: reward.rewardId,
          partnerId: reward.partnerId,
        });
      }
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
      {reward.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={reward.imageUrl}
          alt=""
          className="w-full h-28 object-cover rounded-lg mb-1"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#1B2B1E] font-medium leading-snug">
            {reward.title}
          </p>
          <p className="text-[10px] text-[#6B7F6E] mt-0.5">
            {reward.brandName ? (
              <>
                by <span className="text-[#2D6A4F] font-medium">{reward.brandName}</span>
                {" · "}at {partnerName}
              </>
            ) : (
              <>at {partnerName}</>
            )}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-[#2D6A4F] font-bold text-sm block">
            {reward.pointsCost.toLocaleString()} pts
          </span>
          {reward.rupeeValue != null && reward.rupeeValue > 0 && (
            <span className="text-[10px] text-[#6B7F6E]">Worth ₹{reward.rupeeValue}</span>
          )}
        </div>
      </div>

      {reward.description && reward.description !== reward.title && (
        <p className="text-xs text-[#6B7F6E] leading-snug line-clamp-2">
          {reward.description}
        </p>
      )}

      {reward.stockMode === "limited" && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#6B7F6E]">
            <span>{reward.remaining} remaining</span>
            <span
              className={
                outOfStock
                  ? "text-red-500"
                  : stockPct < 20
                  ? "text-[#FB8500]"
                  : "text-[#74C69D]"
              }
            >
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
      )}

      {maxClaims !== null && (
        <p className="text-[10px] text-[#6B7F6E]">
          {getClaimLimitLabel(reward.claimLimitMode, reward.maxClaimsPerUser)}
          {userClaims !== null && ` · ${userClaims} claimed`}
        </p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={!canAfford || outOfStock || loading || claimsExhausted}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold
                    active:scale-95 transition-all duration-150
                    ${
                      canAfford && !outOfStock && !claimsExhausted
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
          : claimsExhausted
          ? "Claim limit reached"
          : outOfStock
          ? "Out of Stock"
          : !canAfford
          ? `Need ${(reward.pointsCost - userPoints).toLocaleString()} more pts`
          : "Claim Reward"}
      </button>
    </div>
  );
}
