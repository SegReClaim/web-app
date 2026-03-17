"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m, type Variants } from "framer-motion";

const rewards = [
  {
    partner: "Chai Point",
    reward: "20% off any drink",
    points: 100,
    emoji: "☕",
    color: "#8B5E3C",
  },
  {
    partner: "EcoMart",
    reward: "₹50 store credit",
    points: 200,
    emoji: "🌿",
    color: "#2D6A4F",
  },
  {
    partner: "The Good Journal",
    reward: "Free monthly issue",
    points: 150,
    emoji: "📖",
    color: "#3A86FF",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function RewardsPreview() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="py-24 px-6" style={{ backgroundColor: "#F8F4EF" }}>
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#1B2B1E" }}>
            Real rewards from real brands
          </h2>
          <p
            className="mt-3 text-base"
            style={{ color: "#6B7F6E", lineHeight: 1.7 }}
          >
            Earn points with every deposit. Redeem at our partner brands.
          </p>
        </m.div>

        {/* Cards */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-4xl mx-auto mt-12 flex flex-nowrap overflow-x-auto sm:grid sm:grid-cols-3 gap-5 pb-4 sm:pb-0 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {rewards.map((reward) => (
            <m.div
              key={reward.partner}
              variants={cardVariants}
              className="relative flex flex-col gap-4 p-6 rounded-2xl bg-white snap-center shrink-0 w-72 sm:w-auto"
              style={{ boxShadow: "0 4px 20px rgba(45,106,79,0.10)" }}
            >
              {/* Partner emoji & name */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">{reward.emoji}</span>
                <h3 className="font-bold text-lg" style={{ color: "#1B2B1E" }}>
                  {reward.partner}
                </h3>
              </div>

              {/* Reward description */}
              <p className="text-base" style={{ color: "#6B7F6E" }}>
                {reward.reward}
              </p>

              <div className="flex items-center justify-between mt-auto">
                {/* Points pill */}
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "#D8F3DC", color: "#2D6A4F" }}
                >
                  {reward.points} pts
                </span>

                {/* Claim button (greyed out with tooltip) */}
                <div className="relative group">
                  <button
                    disabled
                    className="px-4 py-1.5 rounded-full text-sm font-medium cursor-not-allowed"
                    style={{
                      backgroundColor: "#E8E8E8",
                      color: "#AAAAAA",
                    }}
                    aria-label="Login to claim"
                  >
                    Claim →
                  </button>
                  <div
                    className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                    style={{ backgroundColor: "#1B2B1E", color: "white" }}
                  >
                    Login to claim
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </m.div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href="/login"
            className="text-base font-semibold transition-colors duration-150 hover:underline"
            style={{ color: "#2D6A4F" }}
          >
            Start earning points today →
          </Link>
        </div>
      </section>
    </LazyMotion>
  );
}
