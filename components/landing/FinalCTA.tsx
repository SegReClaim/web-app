"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";

export default function FinalCTA() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden"
        style={{ backgroundColor: "#1B4332" }}
      >


        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
          {/* Heading */}
          <m.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="font-extrabold text-3xl sm:text-5xl text-white leading-tight"
          >
            Ready to make recycling rewarding?
          </m.h2>

          {/* Subtext */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-base sm:text-lg"
            style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}
          >
            Join SegReClaim. Drop your first item. Earn your first points.
          </m.p>

          {/* CTA Button */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Link
              href="/login"
              className="inline-block px-10 py-4 rounded-full font-bold text-lg transition-all duration-200 ease-in-out hover:scale-[1.03] hover:bg-white"
              style={{ backgroundColor: "#74C69D", color: "#1B2B1E" }}
            >
              Create your free account
            </Link>
          </m.div>

          {/* Sign in link */}
          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-2 hover:text-white transition-colors duration-150"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Sign in
            </Link>
          </m.p>
        </div>
      </section>
    </LazyMotion>
  );
}
