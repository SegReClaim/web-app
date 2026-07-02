"use client";

import { PartnerFormData } from "@/types";
import {
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  AdminSection,
} from "./AdminField";

interface PartnerFormProps {
  data: PartnerFormData;
  onChange: (data: PartnerFormData) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}

export default function PartnerForm({
  data,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
}: PartnerFormProps) {
  const set = <K extends keyof PartnerFormData>(key: K, value: PartnerFormData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="max-w-xl space-y-5">
      <AdminSection title="Partner details">
        <AdminField label="Store / partner name" hint="The roof brand — e.g. Soul Stores">
          <AdminInput
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Soul Stores"
            required
          />
        </AdminField>

        <AdminField label="URL slug" hint="Auto-generated from name if empty">
          <AdminInput
            value={data.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="soul-stores"
          />
        </AdminField>

        <AdminField label="Logo URL">
          <AdminInput
            value={data.logoUrl}
            onChange={(e) => set("logoUrl", e.target.value)}
            placeholder="https://…"
            type="url"
          />
        </AdminField>

        <AdminField label="Description">
          <AdminTextarea
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Premium lifestyle retail chain…"
          />
        </AdminField>

        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Contact email">
            <AdminInput
              type="email"
              value={data.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
            />
          </AdminField>
          <AdminField label="Website">
            <AdminInput
              type="url"
              value={data.websiteUrl}
              onChange={(e) => set("websiteUrl", e.target.value)}
            />
          </AdminField>
        </div>

        <AdminField label="Sort order">
          <AdminInput
            type="number"
            value={data.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
        </AdminField>

        <AdminToggle
          label="Active"
          checked={data.active}
          onChange={(v) => set("active", v)}
          description="Only active partners appear in the rewards catalogue"
        />
      </AdminSection>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !data.name.trim()}
        className="w-full rounded-xl bg-[#2D6A4F] text-white py-3 text-sm font-semibold
                   hover:bg-[#1B4332] active:scale-[0.99] transition-all disabled:opacity-50"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
