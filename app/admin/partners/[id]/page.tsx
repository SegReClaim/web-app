"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import PartnerForm from "@/components/admin/PartnerForm";
import {
  getPartner,
  getRewardsForPartner,
  partnerDocToForm,
  updatePartner,
} from "@/lib/admin-firestore";
import { PartnerDoc, PartnerFormData, RewardDoc } from "@/types";
import { friendlyError } from "@/lib/utils";
import SkeletonCard from "@/components/ui/SkeletonCard";

export default function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerDoc | null>(null);
  const [rewards, setRewards] = useState<RewardDoc[]>([]);
  const [data, setData] = useState<PartnerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPartner(id), getRewardsForPartner(id)])
      .then(([p, r]) => {
        if (!p) {
          router.replace("/admin/partners");
          return;
        }
        setPartner(p);
        setData(partnerDocToForm(p));
        setRewards(r);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSubmit() {
    if (!data) return;
    setSubmitting(true);
    setError(null);
    try {
      await updatePartner(id, data);
      const updated = await getPartner(id);
      if (updated) setPartner(updated);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !data) {
    return <SkeletonCard className="h-64 mt-4" />;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/partners"
        className="inline-flex items-center gap-1 text-sm text-[#6B7F6E] hover:text-[#2D6A4F]"
      >
        <ChevronLeft size={16} /> Back to partners
      </Link>
      <h1 className="text-2xl font-bold text-[#1B2B1E]">Edit {partner?.name}</h1>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
      <PartnerForm
        data={data}
        onChange={setData}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save partner"
      />

      <div className="pt-4 border-t border-[#D8F3DC]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1B2B1E]">Rewards under this partner</h2>
          <Link
            href={`/admin/rewards/new?partnerId=${id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2D6A4F]"
          >
            <Plus size={16} /> Add reward
          </Link>
        </div>
        {rewards.length === 0 ? (
          <p className="text-sm text-[#6B7F6E]">No rewards yet for this partner.</p>
        ) : (
          <div className="space-y-2">
            {rewards.map((r) => (
              <Link
                key={r.rewardId}
                href={`/admin/rewards/${r.rewardId}?partnerId=${id}`}
                className="block rounded-xl bg-white px-4 py-3 hover:bg-[#F8F4EF] transition-colors"
                style={{ boxShadow: "0 1px 6px rgba(45,106,79,0.06)" }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-sm text-[#1B2B1E]">{r.title}</p>
                    {r.brandName && (
                      <p className="text-xs text-[#2D6A4F]">by {r.brandName}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-[#2D6A4F]">
                    {r.pointsCost} pts
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
