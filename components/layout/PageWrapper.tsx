"use client";

import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <main
      className={`min-h-screen bg-[#F8F4EF] pt-4 pb-24 md:pt-24 md:pb-10 px-4 ${className}`}
    >
      <div className="mx-auto max-w-2xl">
        {children}
      </div>
    </main>
  );
}
