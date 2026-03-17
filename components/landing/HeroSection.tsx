"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LazyMotion, domAnimation, m, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Leaf, Zap, Star } from "lucide-react";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () => import("@/components/ui/ParticleBackground"),
  { ssr: false }
);

// ── Hero Visual: floating kiosk/reward card illustration ──────────────────────
function HeroVisual() {
  return (
    <m.div
      initial={{ opacity: 0, x: 40, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-sm mx-auto select-none"
      aria-hidden="true"
    >
      {/* Glow behind card */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #74C69D 0%, #2D6A4F 60%, transparent 100%)" }}
      />

      {/* Main kiosk card */}
      <m.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(116,198,157,0.25)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Kiosk header */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(116,198,157,0.15)" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#2D6A4F" }}>
            <Leaf className="w-4 h-4" style={{ color: "#74C69D" }} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">SegReClaim Kiosk</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(116,198,157,0.8)" }}>Scanning deposit…</p>
          </div>
          <div className="ml-auto flex gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: "#74C69D" }}>Live</span>
          </div>
        </div>

        {/* AI scanning animation */}
        <div className="px-5 py-5">
          <div
            className="rounded-2xl p-4 mb-4 relative overflow-hidden"
            style={{ backgroundColor: "rgba(45,106,79,0.3)", border: "1px solid rgba(116,198,157,0.2)" }}
          >
            {/* Scanning line */}
            <m.div
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-0.5 opacity-70"
              style={{ backgroundColor: "#74C69D", boxShadow: "0 0 8px #74C69D" }}
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Item detected</p>
                <p className="text-base font-bold text-white mt-0.5">PET Bottle · 148g</p>
              </div>
              {/* Bottle icon built from SVG */}
              <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
                <rect x="12" y="0" width="12" height="6" rx="3" fill="rgba(58,134,255,0.6)" />
                <rect x="6" y="6" width="24" height="4" rx="2" fill="rgba(58,134,255,0.5)" />
                <rect x="4" y="10" width="28" height="34" rx="8" fill="rgba(58,134,255,0.25)" stroke="rgba(58,134,255,0.6)" strokeWidth="1.5" />
                <rect x="9" y="16" width="6" height="20" rx="3" fill="rgba(58,134,255,0.2)" />
              </svg>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <m.div
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: "#74C69D" }}
                />
              </div>
              <p className="text-xs" style={{ color: "#74C69D" }}>AI scanning</p>
            </div>
          </div>

          {/* Points earned */}
          <m.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: "rgba(116,198,157,0.12)", border: "1px solid rgba(116,198,157,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "#74C69D" }} />
              <span className="text-sm font-semibold text-white">Points earned</span>
            </div>
            <span className="text-lg font-extrabold" style={{ color: "#74C69D" }}>+74 pts</span>
          </m.div>
        </div>

        {/* Waste type chips */}
        <div
          className="px-5 pb-5 flex gap-2 flex-wrap"
        >
          {[
            { label: "Plastic", color: "#3A86FF" },
            { label: "Glass", color: "#8338EC" },
            { label: "Aluminium", color: "#FF6B35" },
            { label: "Paper", color: "#FB8500" },
          ].map((w) => (
            <span
              key={w.label}
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${w.color}22`, color: w.color, border: `1px solid ${w.color}44` }}
            >
              {w.label}
            </span>
          ))}
        </div>
      </m.div>

      {/* Floating stars decoration */}
      {[
        { top: "-12px", right: "20px", delay: 0 },
        { top: "40%", right: "-16px", delay: 0.6 },
        { bottom: "10%", left: "-10px", delay: 1.1 },
      ].map((pos, i) => (
        <m.div
          key={i}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: pos.delay, ease: "easeInOut" }}
          className="absolute"
          style={pos}
        >
          <Star className="w-4 h-4 fill-current" style={{ color: "#74C69D" }} />
        </m.div>
      ))}

      {/* Floating small reward badge */}
      <m.div
        animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-5 -left-8 rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2"
        style={{
          background: "linear-gradient(135deg, #2D6A4F, #1B4332)",
          border: "1px solid rgba(116,198,157,0.3)",
        }}
      >
        <span className="text-lg">🎁</span>
        <div>
          <p className="text-xs font-bold text-white leading-none">Reward unlocked</p>
          <p className="text-xs mt-0.5" style={{ color: "#74C69D" }}>Chai Point — 20% off</p>
        </div>
      </m.div>
    </m.div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const { scrollY } = useScroll();
  const badgeY = useTransform(scrollY, [0, 400], [0, -60]);
  const subheadY = useTransform(scrollY, [0, 400], [0, -30]);

  useEffect(() => {
    const onScroll = () => setShowScrollIndicator(window.scrollY < 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headline1Words = ["Recycle."];
  const headline2Words = ["Earn", "real", "rewards."];

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        className="relative min-h-screen flex items-center"
        style={{ backgroundColor: "#1B4332", overflow: "clip", contain: "layout paint" }}
      >
        {/* Particle Background — wrapped in a clipping container */}
        <div className="absolute inset-0 z-0" style={{ overflow: "hidden", pointerEvents: "none" }}>
          <ParticleBackground count={55} speed={0.5} />
        </div>

        {/* Radial gradient backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(45,106,79,0.6) 0%, transparent 70%), radial-gradient(ellipse 50% 80% at 80% 60%, rgba(27,67,50,0.8) 0%, transparent 80%)",
          }}
        />

        {/* ── Two-column layout ── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left: text content */}
          <div className="flex-1 flex flex-col items-start gap-7 text-left">
            {/* Badge */}
            <m.div style={{ y: badgeY }}>
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: "rgba(116,198,157,0.15)",
                  color: "#74C69D",
                  border: "1px solid rgba(116,198,157,0.3)",
                }}
              >
                <span>♻</span>
                <span>Now live in Ahmedabad</span>
              </m.div>
            </m.div>

            {/* Headline */}
            <div className="flex flex-col gap-0">
              <div className="flex flex-wrap gap-x-4">
                {headline1Words.map((word, i) => (
                  <m.span
                    key={word}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * i, ease: "easeOut" }}
                    className="font-extrabold text-white"
                    style={{ fontSize: "clamp(44px, 6vw, 76px)", lineHeight: 1.05 }}
                  >
                    {word}
                  </m.span>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4">
                {headline2Words.map((word, i) => (
                  <m.span
                    key={`${word}-${i}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + 0.1 * i, ease: "easeOut" }}
                    className="font-extrabold"
                    style={{ fontSize: "clamp(44px, 6vw, 76px)", lineHeight: 1.05, color: "#74C69D" }}
                  >
                    {word}
                  </m.span>
                ))}
              </div>
            </div>

            {/* Subheadline */}
            <m.p
              style={{ y: subheadY, color: "rgba(255,255,255,0.72)", lineHeight: 1.75 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="max-w-lg text-base sm:text-lg"
            >
              Drop your plastic, glass, aluminium, or paper into a SegReClaim kiosk.
              Our AI identifies it instantly. You earn points. Redeem for real rewards.
            </m.p>

            {/* CTA Buttons */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-150 ease-in-out hover:scale-[1.02] hover:bg-white"
                style={{ backgroundColor: "#74C69D", color: "#1B2B1E" }}
              >
                Start earning →
              </Link>
              <button
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-3.5 rounded-full font-semibold text-base text-white transition-all duration-150 ease-in-out hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.5)" }}
              >
                See how it works
              </button>
            </m.div>

            {/* Trust Stats */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3 text-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <span>2,400+ kg recycled</span>
              <span className="opacity-40">·</span>
              <span>1,200+ users</span>
              <span className="opacity-40">·</span>
              <span>8 partner brands</span>
            </m.div>
          </div>

          {/* Right: Hero visual */}
          <div className="flex-1 hidden lg:flex items-center justify-center relative pb-8">
            <HeroVisual />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500"
          style={{ opacity: showScrollIndicator ? 0.45 : 0 }}
          aria-hidden="true"
        >
          <m.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-7 h-7 text-white" />
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
