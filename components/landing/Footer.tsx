import Image from "next/image";
import Link from "next/link";
import { Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="py-8 px-6"
      style={{ backgroundColor: "#1B2B1E" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Logo + copyright */}
        <div className="flex items-center gap-3">
          <Image
            src="/segreclaim-logo.png"
            alt="SegReClaim"
            width={28}
            height={28}
            className="rounded-full opacity-80"
          />
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
            SegReClaim
          </span>
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            © 2025
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm transition-colors duration-150 hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm transition-colors duration-150 hover:text-white"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            About Us
          </Link>
          <a
            href="https://www.linkedin.com/company/segreclaim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm transition-all duration-150 hover:text-white hover:scale-105"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </a>
        </div>

        {/* Tagline */}
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
          Built for a cleaner tomorrow.
        </p>
      </div>
    </footer>
  );
}
