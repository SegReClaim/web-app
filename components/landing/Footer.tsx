export default function Footer() {
  return (
    <footer
      className="py-8 px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      style={{ backgroundColor: "#1B2B1E" }}
    >
      {/* Logo + copyright */}
      <div className="flex items-center gap-3">
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M16 4C16 4 6 8 6 18C6 24.627 10.373 29 16 29C16 29 16 18 26 12C26 12 22 4 16 4Z"
            fill="#74C69D"
          />
          <path
            d="M16 29C16 29 10 22 10 18"
            stroke="rgba(116,198,157,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
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
