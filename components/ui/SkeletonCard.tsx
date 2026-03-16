"use client";

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export default function SkeletonCard({ lines = 3, className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 ${className}`}
      style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
    >
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-2/3 rounded-lg bg-[#D8F3DC]" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-lg bg-[#D8F3DC]"
            style={{ width: i % 3 === 0 ? "80%" : i % 3 === 1 ? "65%" : "72%" }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse h-3 rounded-lg bg-[#D8F3DC] ${className}`} />;
}
