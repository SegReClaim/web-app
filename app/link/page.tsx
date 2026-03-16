import { Suspense } from "react";
import LinkPageInner from "./LinkPageInner";

export default function LinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#D8F3DC] animate-pulse" />
            <p className="text-[#6B7F6E] text-sm">Loading session…</p>
          </div>
        </div>
      }
    >
      <LinkPageInner />
    </Suspense>
  );
}
