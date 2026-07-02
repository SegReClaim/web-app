"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Store } from "lucide-react";
import { getAllPartners } from "@/lib/admin-firestore";
import { PartnerDoc } from "@/types";
import SkeletonCard from "@/components/ui/SkeletonCard";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPartners()
      .then(setPartners)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B1E]">Partners</h1>
          <p className="text-sm text-[#6B7F6E] mt-1">
            Roof stores where users redeem rewards
          </p>
        </div>
        <Link
          href="/admin/partners/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#1B4332]"
        >
          <Plus size={16} />
          Add partner
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard className="h-20" />
          <SkeletonCard className="h-20" />
        </div>
      ) : partners.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-10 text-center"
          style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
        >
          <Store size={40} className="mx-auto text-[#74C69D] mb-3" />
          <p className="font-semibold text-[#1B2B1E]">No partners yet</p>
          <p className="text-sm text-[#6B7F6E] mt-1 mb-4">
            Create your first partner store — e.g. Soul Stores
          </p>
          <Link
            href="/admin/partners/new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2D6A4F]"
          >
            <Plus size={16} /> Create partner
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <div
              key={p.partnerId}
              className="rounded-2xl bg-white p-4 flex items-center gap-4"
              style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
            >
              {p.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.logoUrl}
                  alt=""
                  className="w-12 h-12 rounded-xl object-contain bg-[#F8F4EF] p-1"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#D8F3DC] flex items-center justify-center text-xl">
                  🏪
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1B2B1E]">{p.name}</p>
                <p className="text-xs text-[#6B7F6E] truncate">
                  {p.slug ?? p.partnerId}
                  {p.contactEmail ? ` · ${p.contactEmail}` : ""}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  p.active
                    ? "bg-[#D8F3DC] text-[#2D6A4F]"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {p.active ? "Active" : "Inactive"}
              </span>
              <Link
                href={`/admin/partners/${p.partnerId}`}
                className="p-2 rounded-xl hover:bg-[#D8F3DC] text-[#2D6A4F] transition-colors"
              >
                <Pencil size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
