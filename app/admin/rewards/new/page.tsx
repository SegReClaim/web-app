"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import RewardForm from "@/components/admin/RewardForm";
import {
  defaultRewardForm,
  createReward,
  getAllPartners,
} from "@/lib/admin-firestore";
import { PartnerDoc, RewardFormData } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { friendlyError } from "@/lib/utils";
import SkeletonCard from "@/components/ui/SkeletonCard";

function NewRewardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const prefillPartner = params.get("partnerId") ?? "";
  const { user } = useAuth();

  const [partners, setPartners] = useState<PartnerDoc[]>([]);
  const [data, setData] = useState<RewardFormData>(() =>
    defaultRewardForm(prefillPartner)
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllPartners()
      .then(setPartners)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const rewardId = await createReward(data, user.uid);
      router.push(`/admin/rewards/${rewardId}?partnerId=${data.partnerId}`);
    } catch (e) {
      setError(friendlyError(e));
      setSubmitting(false);
    }
  }

  if (loading) return <SkeletonCard className="h-64" />;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/rewards"
        className="inline-flex items-center gap-1 text-sm text-[#6B7F6E] hover:text-[#2D6A4F]"
      >
        <ChevronLeft size={16} /> Back to rewards
      </Link>
      <h1 className="text-2xl font-bold text-[#1B2B1E]">New reward</h1>
      {partners.length === 0 && (
        <p className="text-sm text-[#FB8500] bg-[#FFF8F0] rounded-xl px-4 py-2">
          Create a partner first before adding rewards.{" "}
          <Link href="/admin/partners/new" className="underline font-semibold">
            Add partner
          </Link>
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
      <RewardForm
        data={data}
        partners={partners}
        onChange={setData}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Create reward"
      />
    </div>
  );
}

export default function NewRewardPage() {
  return (
    <Suspense fallback={<SkeletonCard className="h-64" />}>
      <NewRewardInner />
    </Suspense>
  );
}
