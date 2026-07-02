"use client";

import { useEffect, useState, Suspense, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import RewardForm from "@/components/admin/RewardForm";
import {
  getAllPartners,
  getReward,
  rewardDocToForm,
  updateReward,
  setRewardActive,
} from "@/lib/admin-firestore";
import { PartnerDoc, RewardFormData } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { friendlyError } from "@/lib/utils";
import SkeletonCard from "@/components/ui/SkeletonCard";

function EditRewardInner({ rewardId }: { rewardId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerIdParam = searchParams.get("partnerId") ?? "";
  const { user } = useAuth();

  const [partners, setPartners] = useState<PartnerDoc[]>([]);
  const [partnerId, setPartnerId] = useState(partnerIdParam);
  const [data, setData] = useState<RewardFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const pList = await getAllPartners();
      setPartners(pList);

      let pid = partnerIdParam;
      if (!pid) {
        for (const p of pList) {
          const r = await getReward(p.partnerId, rewardId);
          if (r) {
            pid = p.partnerId;
            setData(rewardDocToForm(r, pid));
            break;
          }
        }
      } else {
        const r = await getReward(pid, rewardId);
        if (r) setData(rewardDocToForm(r, pid));
      }

      if (!pid) {
        router.replace("/admin/rewards");
        return;
      }
      setPartnerId(pid);
      setLoading(false);
    }
    load();
  }, [rewardId, partnerIdParam, router]);

  async function handleSubmit() {
    if (!user || !data) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateReward(partnerId, rewardId, data, user.uid);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive() {
    if (!data) return;
    const next = !data.active;
    try {
      await setRewardActive(partnerId, rewardId, next);
      setData({ ...data, active: next });
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  if (loading || !data) return <SkeletonCard className="h-64" />;

  const partnerName = partners.find((p) => p.partnerId === partnerId)?.name;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/rewards"
        className="inline-flex items-center gap-1 text-sm text-[#6B7F6E] hover:text-[#2D6A4F]"
      >
        <ChevronLeft size={16} /> Back to rewards
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#1B2B1E]">Edit reward</h1>
        <button
          type="button"
          onClick={toggleActive}
          className={`text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-colors ${
            data.active
              ? "border-red-200 text-red-500 hover:bg-red-50"
              : "border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#D8F3DC]"
          }`}
        >
          {data.active ? "Deactivate" : "Activate"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
      <RewardForm
        data={data}
        partners={partners}
        onChange={setData}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save changes"
        partnerName={partnerName}
      />
    </div>
  );
}

export default function EditRewardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<SkeletonCard className="h-64" />}>
      <EditRewardInner rewardId={id} />
    </Suspense>
  );
}
