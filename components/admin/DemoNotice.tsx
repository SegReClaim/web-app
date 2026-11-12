"use client";

import { isEmulatorMode } from "@/lib/firebase";

export default function DemoNotice() {
  if (!isEmulatorMode) return null;
  return <p role="status" className="mb-6 rounded-xl bg-[#D8F3DC] px-4 py-3 text-sm text-[#1B4332]">
    Local demo environment. Profiles and activity are illustrative.
  </p>;
}
