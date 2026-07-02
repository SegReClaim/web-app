"use client";

interface AdminFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminField({ label, hint, children, className = "" }: AdminFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold text-[#1B2B1E]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#6B7F6E]">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#D8F3DC] bg-white px-3 py-2.5 text-sm text-[#1B2B1E] placeholder:text-[#6B7F6E]/60 focus:outline-none focus:ring-2 focus:ring-[#74C69D] focus:border-transparent";

export function AdminInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return <input className={inputClass} {...props} />;
}

export function AdminTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      className={`${inputClass} min-h-[88px] resize-y`}
      {...props}
    />
  );
}

export function AdminSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return <select className={inputClass} {...props} />;
}

interface AdminToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}

export function AdminToggle({ label, checked, onChange, description }: AdminToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-[#2D6A4F]" : "bg-[#D8F3DC]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-[#1B2B1E] group-hover:text-[#2D6A4F]">
          {label}
        </p>
        {description && (
          <p className="text-xs text-[#6B7F6E] mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

export function AdminSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(45,106,79,0.08)" }}
    >
      <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] px-5 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
