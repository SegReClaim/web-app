"use client";

import { LazyMotion, domAnimation, m, type Variants } from "framer-motion";
import { QrCode, Trash2, Cpu, Gift } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: QrCode,
    title: "Scan QR",
    description: "Scan the QR on any SegReClaim kiosk with your phone",
  },
  {
    number: "02",
    icon: Trash2,
    title: "Deposit",
    description: "Drop in your plastic, glass, aluminium, or paper",
  },
  {
    number: "03",
    icon: Cpu,
    title: "AI scans",
    description: "Our computer vision identifies and weighs it instantly",
  },
  {
    number: "04",
    icon: Gift,
    title: "Earn & claim",
    description: "Points hit your account in seconds. Redeem for rewards.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HowItWorks() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="how-it-works"
        className="py-24 px-6"
        style={{ backgroundColor: "#F8F4EF" }}
      >
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: "#1B2B1E" }}
          >
            How SegReClaim works
          </h2>
        </m.div>

        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col lg:flex-row items-stretch">
                <m.div
                  variants={itemVariants}
                  className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white flex-1"
                  style={{ boxShadow: "0 2px 16px rgba(27,75,50,0.08)" }}
                >
                  {/* Large number watermark */}
                  <span
                    className="absolute top-3 left-4 text-6xl font-extrabold select-none pointer-events-none"
                    style={{ color: "#D8F3DC", lineHeight: 1 }}
                  >
                    {step.number}
                  </span>

                  {/* Icon */}
                  <div
                    className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 mt-4"
                    style={{ backgroundColor: "#D8F3DC" }}
                  >
                    <Icon className="w-7 h-7" style={{ color: "#2D6A4F" }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="relative z-10 text-lg font-bold mb-2"
                    style={{ color: "#1B2B1E" }}
                  >
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="relative z-10 text-sm leading-relaxed"
                    style={{ color: "#6B7F6E", lineHeight: 1.7 }}
                  >
                    {step.description}
                  </p>
                </m.div>

                {/* Dashed arrow between steps on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center w-6 shrink-0">
                    <span
                      className="text-xl font-bold select-none"
                      style={{ color: "#74C69D" }}
                    >
                      →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </m.div>
      </section>
    </LazyMotion>
  );
}
