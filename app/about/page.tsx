"use client";

import Link from "next/link";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Linkedin, Leaf, Recycle, Users, Lightbulb, Target } from "lucide-react";
import LandingNavbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

// ── Team Data ────────────────────────────────────────────────────────────────
const team = [
  {
    name: "Harshil Patel",
    role: "Co-Founder",
    bio: "Passionate about building sustainable systems and scalable tech products. Harshil drives product vision and strategy at SegReClaim, ensuring the platform delivers real environmental impact at scale.",
    linkedin: "https://www.linkedin.com/in/harshil-patel-profile20/",
    image: "/harshil.png",
    initials: "HP",
    accentColor: "#74C69D",
  },
  {
    name: "Rikin Parekh",
    role: "Co-Founder",
    bio: "Engineer at heart, entrepreneur by choice. Rikin leads technology and operations at SegReClaim, building AI-powered kiosk systems that make recycling effortless for everyone.",
    linkedin: "https://www.linkedin.com/in/parekh-rikin",
    image: "/rikin.png",
    initials: "RP",
    accentColor: "#74C69D",
  },
];

// ── Values ───────────────────────────────────────────────────────────────────
const values = [
  {
    icon: Leaf,
    title: "Planet First",
    description:
      "Every decision we make is guided by its environmental impact. We measure success in kilograms recycled, not just rupees earned.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "SegReClaim thrives when communities participate. We design every feature to be inclusive, rewarding, and easy for anyone to use.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Minded",
    description:
      "From AI-powered material identification to gamified rewards, we push technology to serve sustainability in ways never seen before.",
  },
  {
    icon: Target,
    title: "Impact Focused",
    description:
      "We set bold recycling targets and track them transparently. Accountability to our planet and our users drives everything we build.",
  },
];

// ── Stat cards ───────────────────────────────────────────────────────────────
const stats = [
  { value: "2,400+", label: "kg recycled" },
  { value: "1,200+", label: "active users" },
  { value: "8", label: "partner brands" },
  { value: "2024", label: "founded" },
];

// ── Team Card ────────────────────────────────────────────────────────────────
function TeamCard({
  member,
  index,
}: {
  member: (typeof team)[0];
  index: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className="relative group rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(116,198,157,0.15)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(116,198,157,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="p-8 flex flex-col items-center text-center gap-6">
        {/* Avatar */}
        <m.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-2xl">
            <Image
              src={member.image}
              alt={member.name}
              fill
              className="object-cover object-top"
              sizes="112px"
            />
          </div>
          {/* Accent ring */}
          <div
            className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"
            style={{
              boxShadow: `0 0 0 3px ${member.accentColor}`,
            }}
          />
        </m.div>

        {/* Info */}
        <div className="flex flex-col gap-2">
          <h3
            className="text-2xl font-extrabold"
            style={{ color: "#F8F4EF" }}
          >
            {member.name}
          </h3>
          <span
            className="inline-block px-4 py-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: "rgba(116,198,157,0.12)",
              color: "#74C69D",
              border: "1px solid rgba(116,198,157,0.25)",
            }}
          >
            {member.role}
          </span>
        </div>

        {/* Bio */}
        <p
          className="text-base leading-relaxed max-w-xs"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {member.bio}
        </p>

        {/* LinkedIn */}
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
          style={{
            backgroundColor: "#0A66C2",
            color: "#fff",
          }}
        >
          <Linkedin className="w-4 h-4" />
          Connect on LinkedIn
        </a>
      </div>
    </m.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <LazyMotion features={domAnimation} strict>
      <main
        className="overflow-x-hidden"
        style={{ backgroundColor: "#1B4332" }}
      >
        <LandingNavbar />

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[55vh] flex items-center pt-24"
          style={{ backgroundColor: "#1B4332" }}
        >
          {/* Radial gradient backdrop */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 70% at 50% 30%, rgba(45,106,79,0.5) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center gap-7">
            {/* Badge */}
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
              <Recycle className="w-4 h-4" />
              <span>Our story</span>
            </m.div>

            {/* Headline */}
            <m.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="font-extrabold text-white"
              style={{ fontSize: "clamp(36px, 5.5vw, 68px)", lineHeight: 1.1 }}
            >
              We&apos;re building a{" "}
              <span style={{ color: "#74C69D" }}>cleaner tomorrow</span>
            </m.h1>

            {/* Subheadline */}
            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
              className="max-w-2xl text-lg leading-relaxed"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              SegReClaim was born from a simple belief: recycling should reward
              you. We combine AI-powered kiosks, gamified points, and real brand
              partnerships to turn everyday waste into everyday value.
            </m.p>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        {/* <section style={{ backgroundColor: "#163829" }}>
          <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <m.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="flex flex-col items-center gap-1 text-center"
              >
                <span
                  className="text-4xl font-extrabold tabular-nums"
                  style={{ color: "#74C69D" }}
                >
                  {s.value}
                </span>
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {s.label}
                </span>
              </m.div>
            ))}
          </div>
        </section> */}

        {/* ── Mission ──────────────────────────────────────────────────── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: "#1B4332" }}
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-8 text-center">
            <m.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="uppercase text-xs tracking-widest font-semibold"
              style={{ color: "#74C69D" }}
            >
              Our Mission
            </m.span>
            <m.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl sm:text-3xl font-bold leading-relaxed"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              To make responsible recycling the{" "}
              <span style={{ color: "#74C69D" }}>default choice</span> for every
              citizen — by making it instant, rewarding, and undeniably fun.
            </m.p>
          </div>
        </section>

        {/* ── Team ─────────────────────────────────────────────────────── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: "#163829" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col gap-14">
            {/* Section header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <m.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="uppercase text-xs tracking-widest font-semibold"
                style={{ color: "#74C69D" }}
              >
                The Team
              </m.span>
              <m.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl font-extrabold text-white"
              >
                Meet the founders
              </m.h2>
              <m.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-md text-base"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Two builders on a mission to close the loop between waste and
                reward.
              </m.p>
            </div>

            {/* Team grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
              {team.map((member, i) => (
                <TeamCard key={member.name} member={member} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Values ───────────────────────────────────────────────────── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: "#1B4332" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col gap-14">
            <div className="flex flex-col items-center gap-3 text-center">
              <m.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="uppercase text-xs tracking-widest font-semibold"
                style={{ color: "#74C69D" }}
              >
                What drives us
              </m.span>
              <m.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl font-extrabold text-white"
              >
                Our values
              </m.h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <m.div
                    key={v.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                    className="rounded-2xl p-7 flex flex-col gap-4 group hover:scale-[1.02] transition-transform duration-300"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(116,198,157,0.12)",
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(116,198,157,0.12)" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#74C69D" }} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{v.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {v.description}
                    </p>
                  </m.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: "#163829" }}
        >
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-7">
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-extrabold text-white"
            >
              Ready to start recycling?
            </m.h2>
            <m.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Join 1,200+ users earning real rewards for doing right by the
              planet.
            </m.p>
            <m.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-150 hover:scale-[1.02] hover:opacity-90"
                style={{ backgroundColor: "#74C69D", color: "#1B2B1E" }}
              >
                Get started →
              </Link>
              <Link
                href="/"
                className="px-8 py-3.5 rounded-full font-semibold text-base text-white transition-all duration-150 hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.4)" }}
              >
                Back to home
              </Link>
            </m.div>
          </div>
        </section>

        <Footer />
      </main>
    </LazyMotion>
  );
}
