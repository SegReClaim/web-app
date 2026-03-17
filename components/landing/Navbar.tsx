"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-200 ease-in-out"
      style={{
        backgroundColor: scrolled ? "#F8F4EF" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(45, 106, 79, 0.15)" : "1px solid transparent",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Leaf shape */}
          <path
            d="M16 4C16 4 6 8 6 18C6 24.627 10.373 29 16 29C16 29 16 18 26 12C26 12 22 4 16 4Z"
            fill="#2D6A4F"
          />
          <path
            d="M16 29C16 29 10 22 10 18"
            stroke="#74C69D"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Recycling arrow hint */}
          <path
            d="M20 10C22 13 22 17 20 20"
            stroke="#74C69D"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
        <span
          className="text-xl font-extrabold tracking-tight transition-colors duration-200"
          style={{ color: scrolled ? "#2D6A4F" : "#ffffff" }}
        >
          SegReClaim
        </span>
      </Link>

      {/* Sign in */}
      <Link
        href="/login"
        className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: scrolled ? "#2D6A4F" : "rgba(255,255,255,0.15)",
          color: scrolled ? "#ffffff" : "#ffffff",
          border: scrolled ? "none" : "1px solid rgba(255,255,255,0.35)",
        }}
        onMouseEnter={(e) => {
          if (scrolled) {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1B4332";
          } else {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.25)";
          }
        }}
        onMouseLeave={(e) => {
          if (scrolled) {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#2D6A4F";
          } else {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.15)";
          }
        }}
      >
        Sign in
      </Link>
    </nav>
  );
}
