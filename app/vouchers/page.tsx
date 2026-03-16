"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageWrapper from "@/components/layout/PageWrapper";
import VoucherCard from "@/components/cards/VoucherCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import { getUserVouchers, getActivePartners } from "@/lib/firestore";
import { VoucherDoc, PartnerDoc, VoucherStatus } from "@/types";
import { friendlyError } from "@/lib/utils";

const STATUS_GROUPS: { key: VoucherStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "redeemed", label: "Redeemed" },
  { key: "expired", label: "Expired" },
];

export default function VouchersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [vouchers, setVouchers] = useState<VoucherDoc[]>([]);
  const [partners, setPartners] = useState<Record<string, PartnerDoc>>({});
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const loadVouchers = useCallback(async () => {
    if (!user) return;
    setVouchersLoading(true);
    setError(null);
    try {
      const [voucherData, partnerData] = await Promise.all([
        getUserVouchers(user.uid),
        getActivePartners(),
      ]);
      setVouchers(voucherData);
      const pm: Record<string, PartnerDoc> = {};
      partnerData.forEach((p) => (pm[p.partnerId] = p));
      setPartners(pm);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setVouchersLoading(false);
    }
  }, [user]);

  useEffect(() => { loadVouchers(); }, [loadVouchers]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-4 mt-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageWrapper>
    );
  }

  const grouped = STATUS_GROUPS.reduce<Record<VoucherStatus, VoucherDoc[]>>(
    (acc, { key }) => {
      acc[key] = vouchers.filter((v) => v.status === key);
      return acc;
    },
    { active: [], redeemed: [], expired: [] }
  );

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#1B2B1E]">My Vouchers</h1>
        <p className="text-sm text-[#6B7F6E] mt-1">
          Show these at partner stores to redeem your rewards
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={loadVouchers} className="ml-auto text-xs text-red-600 underline">
            Retry
          </button>
        </div>
      )}

      {vouchersLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : vouchers.length === 0 ? (
        <EmptyState
          title="No vouchers yet"
          description="Claim rewards from the catalogue to get vouchers you can use at partner stores."
          ctaLabel="Browse Rewards"
          onCta={() => router.push("/rewards")}
        />
      ) : (
        <div className="space-y-6">
          {STATUS_GROUPS.map(({ key, label }) =>
            grouped[key].length === 0 ? null : (
              <div key={key}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-[#1B2B1E]">{label}</h2>
                  <span className="text-xs text-[#6B7F6E] bg-[#D8F3DC] rounded-full px-2 py-0.5">
                    {grouped[key].length}
                  </span>
                </div>
                <div className="space-y-3">
                  {grouped[key].map((v) => (
                    <VoucherCard
                      key={v.voucherId}
                      voucher={v}
                      partnerName={partners[v.partnerId]?.name}
                      onRedeemed={loadVouchers}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </PageWrapper>
  );
}
