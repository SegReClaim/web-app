"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Gift,
  Users,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Store },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[#74C69D]/20 text-[#D8F3DC]"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 bg-[#1B4332] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image
            src="/segreclaim-logo.png"
            alt="SegReClaim"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="font-bold text-white text-sm">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#1B4332] flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image
              src="/segreclaim-logo.png"
              alt="SegReClaim"
              width={36}
              height={36}
              className="rounded-full"
            />
            <div>
              <p className="font-bold text-white text-sm">SegReClaim</p>
              <p className="text-[10px] text-[#74C69D] uppercase tracking-wider">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {nav}

        <div className="mt-auto p-3 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to app
          </Link>
        </div>
      </aside>
    </>
  );
}
