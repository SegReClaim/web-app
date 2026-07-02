"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PartnerForm from "@/components/admin/PartnerForm";
import { defaultPartnerForm, createPartner } from "@/lib/admin-firestore";
import { PartnerFormData } from "@/types";
import { friendlyError } from "@/lib/utils";

export default function NewPartnerPage() {
  const router = useRouter();
  const [data, setData] = useState<PartnerFormData>(defaultPartnerForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const id = await createPartner(data);
      router.push(`/admin/partners/${id}`);
    } catch (e) {
      setError(friendlyError(e));
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/partners"
        className="inline-flex items-center gap-1 text-sm text-[#6B7F6E] hover:text-[#2D6A4F]"
      >
        <ChevronLeft size={16} /> Back to partners
      </Link>
      <h1 className="text-2xl font-bold text-[#1B2B1E]">New partner</h1>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
      <PartnerForm
        data={data}
        onChange={setData}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Create partner"
      />
    </div>
  );
}
