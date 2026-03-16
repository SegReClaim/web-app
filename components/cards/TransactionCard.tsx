"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Star } from "lucide-react";
import { TransactionDoc } from "@/types";
import { formatDate, formatTime, formatWeight } from "@/lib/utils";
import WasteTypePill from "@/components/ui/WasteTypePill";

interface TransactionCardProps {
  transaction: TransactionDoc;
  machineLocation?: string;
}

export default function TransactionCard({
  transaction,
  machineLocation,
}: TransactionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
    >
      {/* Summary row */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#F8F4EF] transition-colors"
      >
        {/* Points earned badge */}
        <div className="w-12 h-12 rounded-xl bg-[#D8F3DC] flex items-center justify-center flex-shrink-0">
          <span className="text-[#2D6A4F] font-bold text-sm leading-none text-center">
            +{transaction.totalPoints}
            <br />
            <span className="font-normal text-[10px]">pts</span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[#6B7F6E] text-xs mb-1">
            {machineLocation && (
              <>
                <MapPin size={10} />
                <span className="truncate">{machineLocation}</span>
                <span className="mx-1">·</span>
              </>
            )}
            <span>{formatDate(transaction.createdAt)}</span>
            <span className="mx-1">·</span>
            <span>{formatTime(transaction.createdAt)}</span>
          </div>

          {/* Waste type pills row */}
          <div className="flex flex-wrap gap-1">
            {transaction.items.map((item, i) => (
              <WasteTypePill key={i} type={item.wasteType} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#6B7F6E] flex-shrink-0">
          <span className="text-xs">{formatWeight(transaction.totalWeightGrams)}</span>
          {expanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </button>

      {/* Expandable item breakdown */}
      {expanded && (
        <div className="border-t border-[#D8F3DC] px-4 pb-4 pt-3 space-y-3">
          {transaction.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Image thumbnail */}
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.wasteType}
                  className="w-12 h-12 rounded-xl object-cover bg-[#D8F3DC] flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#D8F3DC] flex-shrink-0 flex items-center justify-center text-xl">
                  {item.wasteType === "plastic" ? "🧴" : item.wasteType === "glass" ? "🍾" : item.wasteType === "aluminium" ? "🥫" : "📄"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <WasteTypePill type={item.wasteType} />
                  <span className="text-xs text-[#6B7F6E]">{formatWeight(item.weightGrams)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7F6E]">
                  <Star size={10} className="text-[#74C69D]" />
                  <span>Confidence: {Math.round(item.confidenceScore * 100)}%</span>
                </div>
              </div>

              <span className="text-[#2D6A4F] font-semibold text-sm">
                +{item.pointsEarned} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
