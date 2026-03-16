"use client";

import { WasteType } from "@/types";
import { WASTE_COLORS, WASTE_BG_COLORS, WASTE_LABELS, WASTE_EMOJIS } from "@/lib/utils";

interface WasteTypePillProps {
  type: WasteType;
  weightGrams?: number;
  className?: string;
}

export default function WasteTypePill({ type, weightGrams, className = "" }: WasteTypePillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: WASTE_BG_COLORS[type],
        color: WASTE_COLORS[type],
      }}
    >
      <span>{WASTE_EMOJIS[type]}</span>
      <span>{WASTE_LABELS[type]}</span>
      {weightGrams !== undefined && (
        <span className="opacity-70">· {weightGrams}g</span>
      )}
    </span>
  );
}
