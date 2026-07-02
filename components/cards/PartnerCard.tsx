"use client";

import { PartnerWithRewards } from "@/types";
import RewardCard from "./RewardCard";

interface PartnerCardProps {
  partner: PartnerWithRewards;
  userPoints: number;
  onClaimed: () => void;
}

export default function PartnerCard({
  partner,
  userPoints,
  onClaimed,
}: PartnerCardProps) {
  const rewards = partner.rewards;

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
    >
      <div className="flex items-center gap-3 p-4 border-b border-[#D8F3DC]">
        {partner.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={partner.logoUrl}
            alt={partner.name}
            className="w-12 h-12 rounded-xl object-contain bg-[#F8F4EF] p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[#D8F3DC] flex items-center justify-center text-xl flex-shrink-0">
            🏪
          </div>
        )}
        <div>
          <p className="font-semibold text-[#1B2B1E]">{partner.name}</p>
          <p className="text-xs text-[#6B7F6E]">
            {rewards.length} reward{rewards.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.rewardId}
            reward={reward}
            partnerName={partner.name}
            userPoints={userPoints}
            onClaimed={onClaimed}
          />
        ))}
      </div>
    </div>
  );
}
