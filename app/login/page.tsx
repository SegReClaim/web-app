"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { friendlyError } from "@/lib/utils";

function SegReClaimLogo() {
  return (
    <svg width="64" height="64" viewBox="0 0 80 80" fill="none" aria-label="SegReClaim logo">
      <circle cx="40" cy="40" r="38" fill="#D8F3DC" />
      <path
        d="M40 16C26.7 16 16 26.7 16 40s10.7 24 24 24 24-10.7 24-24"
        stroke="#2D6A4F"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 40C64 26.7 53.3 16 40 16"
        stroke="#74C69D"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M40 16 L34 24 L46 24 Z" fill="#2D6A4F" />
      <path
        d="M40 30 C40 30 30 40 40 50 C50 40 40 30 40 30Z"
        fill="#2D6A4F"
        opacity="0.7"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace("/dashboard");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8 flex flex-col items-center gap-6"
        style={{ boxShadow: "0 4px 32px rgba(45,106,79,0.12)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <SegReClaimLogo />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1B2B1E] tracking-tight">
              SegReClaim
            </h1>
            <p className="text-[#6B7F6E] text-sm mt-1">
              Segregate · Recycle · Reward
            </p>
          </div>
        </div>

        {/* Tagline card */}
        <div className="w-full rounded-2xl bg-[#D8F3DC] px-4 py-3 text-center">
          <p className="text-[#2D6A4F] font-semibold text-sm">
            🌿 Recycle smarter. Earn real rewards.
          </p>
          <p className="text-[#6B7F6E] text-xs mt-1 leading-relaxed">
            Deposit recyclable waste at any SegReClaim machine and earn points
            redeemable with partner brands.
          </p>
        </div>

        {/* Sign-in button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          id="google-signin-btn"
          className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-[#D8F3DC]
                     bg-white px-4 py-3 text-[#1B2B1E] font-semibold text-sm
                     hover:border-[#74C69D] hover:bg-[#F8F4EF] active:scale-95
                     transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {/* Google G icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {signingIn ? "Signing in…" : "Continue with Google"}
        </button>

        {error && (
          <p className="text-xs text-red-600 text-center px-2">{error}</p>
        )}

        <p className="text-[10px] text-[#6B7F6E] text-center leading-relaxed">
          By signing in you agree to our Terms of Service and Privacy Policy.
          Phone OTP login coming soon.
        </p>
      </div>
    </div>
  );
}
