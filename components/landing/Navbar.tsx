"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-200 ease-in-out"
      style={{
        backgroundColor: scrolled ? "#F8F4EF" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(45, 106, 79, 0.15)" : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <Image
          src="/segreclaim-logo.png"
          alt="SegReClaim logo"
          width={36}
          height={36}
          className="rounded-full transition-transform duration-300 group-hover:scale-105"
          priority
        />
        <span className="text-xl font-extrabold tracking-tight transition-colors duration-200">
          <span style={{ color: scrolled ? "#1B2B1E" : "#ffffff" }}>Seg</span>
          <span style={{ color: scrolled ? "#2D6A4F" : "#ffffff" }}>Re</span>
          <span style={{ color: scrolled ? "#D4AF37" : "#ffffff" }}>Claim</span>
        </span>
      </Link>

      {/* Sign in */}
      <Link
        href="/login"
        className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: scrolled ? "#2D6A4F" : "rgba(255,255,255,0.15)",
          color: "#ffffff",
          border: scrolled ? "none" : "1px solid rgba(255,255,255,0.35)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = scrolled
            ? "#1B4332"
            : "rgba(255,255,255,0.25)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = scrolled
            ? "#2D6A4F"
            : "rgba(255,255,255,0.15)";
        }}
      >
        Sign in
      </Link>
    </nav>
  );
}
