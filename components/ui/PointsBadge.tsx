"use client";

import { useEffect, useRef, useState } from "react";
import { Leaf } from "lucide-react";
import { animateCounter, formatPoints } from "@/lib/utils";

interface PointsBadgeProps {
  points: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { text: "text-sm", icon: 14, pill: "px-2 py-1 gap-1" },
  md: { text: "text-base", icon: 16, pill: "px-3 py-1.5 gap-1.5" },
  lg: { text: "text-xl font-extrabold", icon: 20, pill: "px-4 py-2 gap-2" },
};

export default function PointsBadge({
  points,
  size = "md",
  animate = true,
  className = "",
}: PointsBadgeProps) {
  const [displayed, setDisplayed] = useState(points);
  const prevRef = useRef(points);
  const s = sizeMap[size];

  useEffect(() => {
    if (!animate || prevRef.current === points) {
      setDisplayed(points);
      prevRef.current = points;
      return;
    }
    const cancel = animateCounter(prevRef.current, points, 800, setDisplayed);
    prevRef.current = points;
    return cancel;
  }, [points, animate]);

  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#2D6A4F] text-white font-semibold tabular-nums ${s.pill} ${s.text} ${className}`}
    >
      <Leaf size={s.icon} className="opacity-80" />
      {formatPoints(displayed)} pts
    </span>
  );
}
