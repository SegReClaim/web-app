"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageWrapper from "@/components/layout/PageWrapper";
import PartnerCard from "@/components/cards/PartnerCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import { getActivePartners } from "@/lib/firestore";
import { PartnerDoc } from "@/types";
import { friendlyError } from "@/lib/utils";

export default function RewardsPage() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  const [partners, setPartners] = useState<PartnerDoc[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getActivePartners();
        setPartners(data);
      } catch (e) {
        setError(friendlyError(e));
      } finally {
        setPartnersLoading(false);
      }
    })();
  }, [user]);

  function handleClaimed() {
    router.push("/vouchers");
  }

  if (loading || !userDoc) {
    return (
      <PageWrapper>
        <div className="space-y-4 mt-2">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-48" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[#1B2B1E]">Rewards</h1>
        <p className="text-sm text-[#6B7F6E] mt-1">
          Spend your points with our partner brands
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#D8F3DC] rounded-xl px-3 py-1.5">
          <span className="text-sm font-bold text-[#2D6A4F]">
            {userDoc.totalPoints.toLocaleString()} pts available
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto text-xs text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {partnersLoading ? (
        <div className="space-y-4">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-48" />
        </div>
      ) : partners.length === 0 ? (
        <EmptyState
          title="No rewards available yet"
          description="We're onboarding partner brands. Check back soon for exciting rewards!"
        />
      ) : (
        <div className="space-y-5">
          {partners.map((partner) => (
            <PartnerCard
              key={partner.partnerId}
              partner={partner}
              userPoints={userDoc.totalPoints}
              onClaimed={handleClaimed}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
