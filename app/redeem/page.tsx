import { Suspense } from "react";
import RedeemPageInner from "./RedeemPageInner";

export const metadata = {
  title: "Redeem Credits | SegReClaim",
  description: "Scan the QR code from your SegReClaim kiosk to redeem your recycling credits.",
};

export default function RedeemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#D8F3DC] animate-pulse" />
            <p className="text-[#6B7F6E] text-sm">Loading…</p>
          </div>
        </div>
      }
    >
      <RedeemPageInner />
    </Suspense>
  );
}
