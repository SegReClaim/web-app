"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function Counter({ target, suffix = "", prefix = "", duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = Math.min(now - startTime, duration);
      const progress = easeOut(elapsed / duration);
      setCount(Math.round(progress * target));
      if (elapsed < duration) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { label: "recycled so far", target: 2400, suffix: " kg", prefix: "" },
  { label: "CO₂ saved", target: 6000, suffix: " kg", prefix: "" },
  { label: "users joined", target: 1200, suffix: "+", prefix: "" },
];

// Decorative leaf SVG watermark
function LeafWatermark() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.06]"
      viewBox="0 0 800 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M400 50C400 50 150 150 150 320C150 430 260 490 400 490C400 490 400 300 620 200C620 200 560 50 400 50Z"
        fill="#74C69D"
      />
      <path
        d="M400 490C400 490 280 380 280 320"
        stroke="#74C69D"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ImpactCounter() {
  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{ backgroundColor: "#2D6A4F" }}
    >
      <LeafWatermark />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-3">
              <span
                className="text-5xl sm:text-6xl font-extrabold"
                style={{ color: "#74C69D" }}
              >
                <Counter target={stat.target} suffix={stat.suffix} prefix={stat.prefix} />
              </span>
              <p className="text-base font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <p
          className="text-center mt-14 text-sm"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          and growing every day
        </p>
      </div>
    </section>
  );
}
