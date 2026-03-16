"use client";

import { useState } from "react";
import { Copy, Check, Clock, RefreshCw } from "lucide-react";
import { VoucherDoc } from "@/types";
import { formatDate, daysUntilExpiry, isExpired } from "@/lib/utils";
import { markVoucherRedeemed } from "@/lib/firestore";
import { friendlyError } from "@/lib/utils";

interface VoucherCardProps {
  voucher: VoucherDoc;
  partnerName?: string;
  onRedeemed?: () => void;
}

export default function VoucherCard({ voucher, partnerName, onRedeemed }: VoucherCardProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expired = isExpired(voucher.expiresAt);
  const days = daysUntilExpiry(voucher.expiresAt);
  const isActive = voucher.status === "active" && !expired;

  async function handleCopy() {
    await navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRedeem() {
    setLoading(true);
    setError(null);
    try {
      await markVoucherRedeemed(voucher.voucherId);
      onRedeemed?.();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    active: "bg-[#D8F3DC] text-[#2D6A4F]",
    redeemed: "bg-gray-100 text-gray-500",
    expired: "bg-red-50 text-red-500",
  };

  return (
    <div
      className={`rounded-2xl bg-white overflow-hidden transition-opacity ${
        !isActive ? "opacity-60" : ""
      }`}
      style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[#6B7F6E] mb-0.5">{partnerName ?? voucher.partnerId}</p>
            <p className="font-semibold text-[#1B2B1E] text-sm leading-snug">
              {voucher.description}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
              statusColors[expired ? "expired" : voucher.status]
            }`}
          >
            {expired ? "Expired" : voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
          </span>
        </div>

        {/* Voucher code */}
        {isActive && (
          <div className="flex items-center gap-2 bg-[#F8F4EF] rounded-xl px-4 py-3">
            <span className="font-mono text-xl tracking-widest text-[#1B2B1E] font-bold flex-1 select-all">
              {voucher.code}
            </span>
            <button
              onClick={handleCopy}
              title="Copy code"
              className="flex items-center gap-1 text-xs text-[#2D6A4F] font-semibold
                         hover:text-[#1B4332] active:scale-95 transition-all duration-150"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        {/* Expiry */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B7F6E]">
          <Clock size={12} />
          {expired
            ? `Expired on ${formatDate(voucher.expiresAt)}`
            : voucher.status === "redeemed"
            ? "Redeemed"
            : days === 1
            ? "Expires tomorrow"
            : `Expires ${formatDate(voucher.expiresAt)} (${days} days)`}
        </div>

        {/* Points spent */}
        <p className="text-xs text-[#6B7F6E]">
          {voucher.pointsSpent.toLocaleString()} pts spent
        </p>

        {/* Redeem button */}
        {isActive && voucher.status === "active" && (
          <button
            onClick={handleRedeem}
            disabled={loading}
            className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#2D6A4F]
                       text-[#2D6A4F] font-semibold text-sm py-2.5
                       hover:bg-[#2D6A4F] hover:text-white active:scale-95 transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
            {loading ? "Marking…" : "Mark as Redeemed"}
          </button>
        )}

        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
