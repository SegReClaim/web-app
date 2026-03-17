import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{ backgroundColor: "#1B2B1E" }}
    >
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

      {/* Tagline */}
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
        Built for a cleaner tomorrow.
      </p>
    </footer>
  );
}
