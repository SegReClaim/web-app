"use client";

import { PartnerDoc } from "@/types";
import RewardCard from "./RewardCard";

interface PartnerCardProps {
  partner: PartnerDoc;
  userPoints: number;
  onClaimed: () => void;
}

export default function PartnerCard({ partner, userPoints, onClaimed }: PartnerCardProps) {
  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
    >
      {/* Partner header */}
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
            {partner.rewardCatalogue.length} reward
            {partner.rewardCatalogue.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* Reward items */}
      <div className="p-4 space-y-3">
        {partner.rewardCatalogue.map((item, i) => (
          <RewardCard
            key={i}
            item={item}
            index={i}
            partnerId={partner.partnerId}
            partnerName={partner.name}
            userPoints={userPoints}
            onClaimed={onClaimed}
          />
        ))}
      </div>
    </div>
  );
}
