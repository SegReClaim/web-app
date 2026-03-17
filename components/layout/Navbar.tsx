"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Gift, Ticket, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PointsBadge from "@/components/ui/PointsBadge";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/vouchers", label: "Vouchers", icon: Ticket },
  { href: "/profile", label: "Profile", icon: User },
];

// SegReClaim logo SVG
function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" fill="#D8F3DC" />
      <path
        d="M24 10C16.3 10 10 16.3 10 24s6.3 14 14 14 14-6.3 14-14"
        stroke="#2D6A4F"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M38 24C38 16.3 31.7 10 24 10"
        stroke="#74C69D"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M24 10 L20 16 L28 16 Z" fill="#2D6A4F" />
      <path
        d="M24 18 C24 18 18 24 24 30 C30 24 24 18 24 18Z"
        fill="#2D6A4F"
        opacity="0.7"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { userDoc } = useAuth();

  // Landing page has its own navbar
  if (pathname === "/") return null;

  return (
    <>
      {/* ── Desktop top bar ─────────────────────────────── */}
      <header className="hidden md:flex fixed top-0 inset-x-0 z-50 h-16 items-center border-b border-[#D8F3DC] bg-[#F8F4EF]/90 backdrop-blur-sm px-6">
        <Link href="/dashboard" className="flex items-center gap-2 mr-8">
          <Logo size={32} />
          <div>
            <span className="font-bold text-[#1B2B1E] text-lg leading-none">
              SegReClaim
            </span>
            <span className="block text-[10px] text-[#6B7F6E] leading-none">
              Segregate · Recycle · Reward
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    active
                      ? "bg-[#2D6A4F] text-white"
                      : "text-[#6B7F6E] hover:bg-[#D8F3DC] hover:text-[#1B2B1E]"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Points badge on the right */}
        {userDoc && (
          <div className="ml-auto">
            <PointsBadge points={userDoc.totalPoints} size="sm" />
          </div>
        )}
      </header>

      {/* ── Mobile bottom bar ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center border-t border-[#D8F3DC] bg-[#F8F4EF]/95 backdrop-blur-sm safe-area-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-medium transition-all duration-150
                ${active ? "text-[#2D6A4F]" : "text-[#6B7F6E]"}`}
            >
              <Icon
                size={20}
                className={active ? "stroke-[2.5]" : "stroke-[1.5]"}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export { Logo };
