"use client";

import { PartnerDoc, RewardFormData } from "@/types";
import {
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminToggle,
  AdminSection,
} from "./AdminField";
import RewardPreview from "./RewardPreview";

interface RewardFormProps {
  data: RewardFormData;
  partners: PartnerDoc[];
  onChange: (data: RewardFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  partnerName?: string;
}

export default function RewardForm({
  data,
  partners,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  partnerName,
}: RewardFormProps) {
  const set = <K extends keyof RewardFormData>(key: K, value: RewardFormData[K]) =>
    onChange({ ...data, [key]: value });

  const selectedPartner =
    partnerName ?? partners.find((p) => p.partnerId === data.partnerId)?.name;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-5">
        <AdminSection title="Basics">
          <AdminField label="Partner (roof store)" hint="Where users redeem — e.g. Soul Stores">
            <AdminSelect
              value={data.partnerId}
              onChange={(e) => set("partnerId", e.target.value)}
              disabled={!!partnerName}
            >
              <option value="">Select partner…</option>
              {partners.map((p) => (
                <option key={p.partnerId} value={p.partnerId}>
                  {p.name}
                </option>
              ))}
            </AdminSelect>
          </AdminField>

          <AdminField
            label="Collaboration brand"
            hint="Optional — e.g. FIFA for merch sold via Soul Stores"
          >
            <AdminInput
              value={data.brandName}
              onChange={(e) => set("brandName", e.target.value)}
              placeholder="FIFA"
            />
          </AdminField>

          <AdminField label="Reward title">
            <AdminInput
              value={data.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="FIFA Official Merch — Cap"
              required
            />
          </AdminField>

          <AdminField label="Description">
            <AdminTextarea
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Limited edition cap. Show voucher at partner counter."
              required
            />
          </AdminField>

          <AdminField label="Image URL" hint="Paste a public image URL (Storage upload coming later)">
            <AdminInput
              value={data.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://…"
              type="url"
            />
          </AdminField>

          <AdminField label="Tags" hint="Comma-separated: merch, limited, fifa">
            <AdminInput
              value={data.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="merch, limited"
            />
          </AdminField>
        </AdminSection>

        <AdminSection title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Points cost">
              <AdminInput
                type="number"
                min={0}
                value={data.pointsCost}
                onChange={(e) => set("pointsCost", Number(e.target.value))}
              />
            </AdminField>
            <AdminField label="Worth (₹)" hint="Display value for users">
              <AdminInput
                type="number"
                min={0}
                value={data.rupeeValue}
                onChange={(e) =>
                  set("rupeeValue", e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="299"
              />
            </AdminField>
          </div>
        </AdminSection>

        <AdminSection title="Stock & claim limits">
          <AdminField label="Stock mode">
            <AdminSelect
              value={data.stockMode}
              onChange={(e) => set("stockMode", e.target.value as RewardFormData["stockMode"])}
            >
              <option value="limited">Limited stock</option>
              <option value="unlimited">Unlimited stock</option>
            </AdminSelect>
          </AdminField>

          {data.stockMode === "limited" && (
            <AdminField label="Total stock">
              <AdminInput
                type="number"
                min={0}
                value={data.totalStock}
                onChange={(e) => set("totalStock", Number(e.target.value))}
              />
            </AdminField>
          )}

          <AdminField label="Per-user claim limit">
            <AdminSelect
              value={data.claimLimitMode}
              onChange={(e) =>
                set("claimLimitMode", e.target.value as RewardFormData["claimLimitMode"])
              }
            >
              <option value="once">Once per user</option>
              <option value="limited">Limited times per user</option>
              <option value="unlimited">Unlimited per user</option>
            </AdminSelect>
          </AdminField>

          {data.claimLimitMode === "limited" && (
            <AdminField label="Max claims per user">
              <AdminInput
                type="number"
                min={1}
                value={data.maxClaimsPerUser}
                onChange={(e) => set("maxClaimsPerUser", Number(e.target.value))}
              />
            </AdminField>
          )}
        </AdminSection>

        <AdminSection title="Schedule & redemption">
          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Valid from" hint="Leave empty for immediate">
              <AdminInput
                type="datetime-local"
                value={data.validFrom}
                onChange={(e) => set("validFrom", e.target.value)}
              />
            </AdminField>
            <AdminField label="Valid until" hint="Leave empty for no end date">
              <AdminInput
                type="datetime-local"
                value={data.validUntil}
                onChange={(e) => set("validUntil", e.target.value)}
              />
            </AdminField>
          </div>

          <AdminField label="Voucher validity (days after claim)">
            <AdminInput
              type="number"
              min={1}
              value={data.voucherValidityDays}
              onChange={(e) => set("voucherValidityDays", Number(e.target.value))}
            />
          </AdminField>

          <AdminField label="Redemption instructions">
            <AdminTextarea
              value={data.redemptionInstructions}
              onChange={(e) => set("redemptionInstructions", e.target.value)}
              placeholder="Show this code at any Soul Stores outlet."
            />
          </AdminField>

          <div className="grid grid-cols-2 gap-4">
            <AdminField label="Sort order" hint="Lower appears first">
              <AdminInput
                type="number"
                value={data.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
              />
            </AdminField>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <AdminToggle
              label="Active"
              checked={data.active}
              onChange={(v) => set("active", v)}
              description="Inactive rewards are hidden from users"
            />
            <AdminToggle
              label="Featured"
              checked={data.featured}
              onChange={(v) => set("featured", v)}
              description="Highlight on rewards page (future)"
            />
          </div>
        </AdminSection>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !data.title || !data.partnerId}
          className="w-full rounded-xl bg-[#2D6A4F] text-white py-3 text-sm font-semibold
                     hover:bg-[#1B4332] active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24">
          <p className="text-xs font-semibold text-[#6B7F6E] uppercase tracking-wider mb-3">
            Live preview
          </p>
          <RewardPreview
            data={data}
            partnerName={selectedPartner ?? "Partner"}
          />
        </div>
      </div>
    </div>
  );
}
