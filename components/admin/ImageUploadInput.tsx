"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { AdminInput } from "./AdminField";
import { uploadImage } from "@/lib/storage";
import { friendlyError } from "@/lib/utils";

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  folder: "rewards" | "partners";
  placeholder?: string;
}

/** URL input with an upload button — pick a file or paste a URL. */
export default function ImageUploadInput({
  value,
  onChange,
  folder,
  placeholder = "https://… or upload",
}: ImageUploadInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <AdminInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="url"
          disabled={uploading}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border-2 border-[#2D6A4F]
                     text-[#2D6A4F] px-3 py-2 text-sm font-semibold hover:bg-[#D8F3DC]
                     transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload size={15} /> Upload
            </>
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {value && !uploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mt-2 h-20 rounded-xl object-contain bg-[#F8F4EF] p-1"
        />
      )}
    </div>
  );
}
