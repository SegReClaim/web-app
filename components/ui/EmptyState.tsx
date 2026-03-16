"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  ctaLabel,
  onCta,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon ?? (
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          className="mb-6 opacity-60"
        >
          {/* Recycling loop motif */}
          <circle cx="40" cy="40" r="36" fill="#D8F3DC" />
          <path
            d="M40 22 C30 22 22 30 22 40 C22 50 30 58 40 58"
            stroke="#2D6A4F"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M40 58 C50 58 58 50 58 40 C58 30 50 22 40 22"
            stroke="#74C69D"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M40 22 L35 28 L45 28 Z" fill="#2D6A4F" />
          <path d="M40 58 L35 52 L45 52 Z" fill="#74C69D" />
          {/* Central leaf */}
          <path
            d="M40 34 C40 34 34 40 40 46 C46 40 40 34 40 34Z"
            fill="#2D6A4F"
            opacity="0.6"
          />
        </svg>
      )}
      <h3 className="text-lg font-semibold text-[#1B2B1E] mb-2">{title}</h3>
      <p className="text-[#6B7F6E] text-sm leading-relaxed max-w-xs mb-6">
        {description}
      </p>
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="rounded-xl bg-[#2D6A4F] text-white px-6 py-2.5 text-sm font-semibold
                     hover:bg-[#1B4332] active:scale-95 transition-all duration-150"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
