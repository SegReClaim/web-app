"use client";

import { RewardFormData } from "@/types";
import { getClaimLimitLabel } from "@/lib/firestore";

interface RewardPreviewProps {
  data: RewardFormData;
  partnerName: string;
}

export default function RewardPreview({ data, partnerName }: RewardPreviewProps) {
  const stockLabel =
    data.stockMode === "unlimited"
      ? "Unlimited stock"
      : `${data.totalStock} in stock`;

  const claimLabel = getClaimLimitLabel(data.claimLimitMode, data.maxClaimsPerUser);

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
    >
      {data.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.imageUrl}
          alt=""
          className="w-full h-36 object-cover bg-[#D8F3DC]"
        />
      ) : (
        <div className="w-full h-36 bg-[#D8F3DC] flex items-center justify-center text-4xl">
          🎁
        </div>
      )}

      <div className="p-4 border-b border-[#D8F3DC]">
        <p className="text-xs text-[#6B7F6E]">{partnerName}</p>
        {data.brandName && (
          <p className="text-xs text-[#2D6A4F] font-medium">
            Collaboration: {data.brandName}
          </p>
        )}
        <p className="font-semibold text-[#1B2B1E] mt-1">
          {data.title || "Reward title"}
        </p>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-[#6B7F6E] leading-relaxed">
          {data.description || "Description will appear here."}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-[#2D6A4F] font-bold text-lg">
            {(data.pointsCost || 0).toLocaleString()} pts
          </span>
          {data.rupeeValue !== "" && data.rupeeValue > 0 && (
            <span className="text-xs text-[#6B7F6E]">Worth ₹{data.rupeeValue}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#D8F3DC] text-[#2D6A4F]">
            {stockLabel}
          </span>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#F8F4EF] text-[#6B7F6E]">
            {claimLabel}
          </span>
          {!data.active && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-red-50 text-red-500">
              Inactive
            </span>
          )}
        </div>

        <button
          type="button"
          disabled
          className="w-full rounded-xl bg-[#2D6A4F] text-white py-2.5 text-sm font-semibold opacity-80"
        >
          Claim Reward
        </button>
      </div>
    </div>
  );
}
