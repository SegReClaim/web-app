"use client";

import { LazyMotion, domAnimation, m, type Variants } from "framer-motion";
import { Package, Wine, Cylinder, FileText } from "lucide-react";

const wasteTypes = [
  {
    name: "Plastic",
    color: "#3A86FF",
    bgGradient: "linear-gradient(135deg, #3A86FF22 0%, #3A86FF08 100%)",
    icon: Package,
    points: "0.5 pts / gram",
    description: "PET bottles, containers, packaging",
    emoji: "🧴",
  },
  {
    name: "Glass",
    color: "#8338EC",
    bgGradient: "linear-gradient(135deg, #8338EC22 0%, #8338EC08 100%)",
    icon: Wine,
    points: "0.8 pts / gram",
    description: "Bottles, jars, any clean glass",
    emoji: "🍾",
  },
  {
    name: "Aluminium",
    color: "#FF6B35",
    bgGradient: "linear-gradient(135deg, #FF6B3522 0%, #FF6B3508 100%)",
    icon: Cylinder,
    points: "2.0 pts / gram",
    description: "Cans, foil, aluminium packaging",
    emoji: "🥫",
  },
  {
    name: "Paper",
    color: "#FB8500",
    bgGradient: "linear-gradient(135deg, #FB850022 0%, #FB850008 100%)",
    icon: FileText,
    points: "0.3 pts / gram",
    description: "Cardboard, newspapers, clean paper",
    emoji: "📦",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

export default function WasteTypes() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="py-24 px-6" style={{ backgroundColor: "#F8F4EF" }}>
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: "#1B2B1E" }}>
            What we accept
          </h2>
          <p className="mt-3 text-base" style={{ color: "#6B7F6E" }}>
            Drop any of these — our AI handles the rest.
          </p>
        </m.div>

        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {wasteTypes.map((waste) => {
            const Icon = waste.icon;
            return (
              <m.div
                key={waste.name}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.15 } }}
                className="group relative rounded-2xl overflow-hidden cursor-default flex flex-col"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {/* Colored banner top area */}
                <div
                  className="relative flex flex-col items-center justify-center pt-8 pb-6 px-5"
                  style={{ background: waste.bgGradient }}
                >
                  {/* Large emoji bg (decorative, faded) */}
                  <span
                    className="absolute text-7xl opacity-10 select-none pointer-events-none"
                    style={{ top: "4px", right: "8px" }}
                  >
                    {waste.emoji}
                  </span>

                  {/* Icon circle */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                    style={{
                      backgroundColor: `${waste.color}18`,
                      border: `1.5px solid ${waste.color}40`,
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: waste.color }} strokeWidth={1.75} />
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-xl" style={{ color: "#1B2B1E" }}>
                    {waste.name}
                  </h3>

                  {/* Points pill */}
                  <span
                    className="mt-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                    style={{
                      backgroundColor: waste.color,
                      color: "#ffffff",
                    }}
                  >
                    {waste.points}
                  </span>
                </div>

                {/* Bottom: description */}
                <div
                  className="px-5 py-4 flex-1"
                  style={{ borderTop: `1px solid ${waste.color}20` }}
                >
                  <p className="text-sm text-center" style={{ color: "#6B7F6E", lineHeight: 1.65 }}>
                    {waste.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div
                  className="h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-out"
                  style={{ backgroundColor: waste.color }}
                />
              </m.div>
            );
          })}
        </m.div>
      </section>
    </LazyMotion>
  );
}
