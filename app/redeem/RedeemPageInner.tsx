"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Leaf,
  ArrowRight,
  Camera,
} from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getRedemptionToken, subscribeToUserDoc } from "@/lib/firestore";
import { RedemptionTokenDoc, UserDoc } from "@/types";
import { friendlyError } from "@/lib/utils";
import { Unsubscribe } from "firebase/firestore";

type PageState =
  | "loading"
  | "scanning"
  | "invalid"
  | "expired"
  | "already_redeemed"
  | "needs_login"
  | "claiming"
  | "claimed"
  | "error";

const CATEGORY_LABEL: Record<string, string> = {
  plastic: "Plastic",
  metal: "Metal",
  aluminium: "Aluminium",
  glass: "Glass",
  paper: "Paper",
  general: "General Waste",
};

const CATEGORY_ICON: Record<string, string> = {
  plastic: "♻️",
  metal: "⚙️",
  aluminium: "🥤",
  glass: "🍾",
  paper: "📄",
  general: "🗑️",
};

export default function RedeemPageInner() {
  const params = useSearchParams();
  const tokenId = params.get("t");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [tokenDoc, setTokenDoc] = useState<RedemptionTokenDoc | null>(null);
  const [creditsAwarded, setCreditsAwarded] = useState(0);
  const [liveUserDoc, setLiveUserDoc] = useState<UserDoc | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const unsubRef = useRef<Unsubscribe | null>(null);

  // ── Validate token ─────────────────────────────────────────────
  const loadToken = useCallback(async () => {
    if (!tokenId) {
      setPageState("scanning");
      return;
    }
    setPageState("loading");
    try {
      const token = await getRedemptionToken(tokenId);

      if (!token) {
        setPageState("invalid");
        return;
      }

      setTokenDoc(token);

      if (token.status === "redeemed") {
        setPageState("already_redeemed");
        return;
      }

      if (
        token.status === "expired" ||
        token.expiresAt.toDate() < new Date()
      ) {
        setPageState("expired");
        return;
      }

      if (token.status === "claimed" && token.userId === user?.uid) {
        // User already claimed this — show success
        setCreditsAwarded(token.credits);
        setPageState("claimed");
        return;
      }

      if (authLoading) return;

      if (!user) {
        setPageState("needs_login");
      } else {
        await performClaim(token, user.uid);
      }
    } catch (e) {
      setErrorMsg(friendlyError(e));
      setPageState("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, user, authLoading]);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  // Subscribe to live points after claim
  useEffect(() => {
    if (pageState === "claimed" && user) {
      unsubRef.current = subscribeToUserDoc(user.uid, setLiveUserDoc);
    }
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [pageState, user]);

  // ── Claim token via Cloud Function ────────────────────────────
  async function performClaim(token: RedemptionTokenDoc, uid: string) {
    void uid; // uid is validated by context.auth in the Cloud Function
    setPageState("claiming");
    try {
      const functions = getFunctions();
      const claimFn = httpsCallable<{ tokenId: string }, { success: boolean; credits: number }>(
        functions,
        "claimRedemptionToken"
      );
      const result = await claimFn({ tokenId: token.tokenId });
      setCreditsAwarded(result.data.credits);
      setPageState("claimed");
    } catch (e) {
      setErrorMsg(friendlyError(e));
      setPageState("error");
    }
  }

  // ── Google Sign-In ────────────────────────────────────────────
  async function handleGoogleSignIn() {
    if (!tokenDoc) return;
    setSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await performClaim(tokenDoc, result.user.uid);
    } catch (e) {
      setErrorMsg(friendlyError(e));
      setPageState("error");
    } finally {
      setSigningIn(false);
    }
  }

  // ── QR Scanner ────────────────────────────────────────────────
  function handleScan(detectedCodes: { rawValue: string }[]) {
    if (detectedCodes.length > 0) {
      const value = detectedCodes[0].rawValue;
      try {
        const url = new URL(value);
        const t = url.searchParams.get("t");
        if (t) {
          router.push(`/redeem?t=${t}`);
        } else {
          setErrorMsg("QR code does not contain a valid token.");
          setPageState("invalid");
        }
      } catch (e) {
        setErrorMsg("Invalid QR code format.");
        setPageState("invalid");
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────
  function timeLeft(): string {
    if (!tokenDoc) return "";
    const msLeft = tokenDoc.expiresAt.toDate().getTime() - Date.now();
    if (msLeft <= 0) return "expired";
    const m = Math.floor(msLeft / 60000);
    const s = Math.floor((msLeft % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FAF4] to-[#E8F5EC] flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-3xl bg-white flex flex-col items-center gap-5 text-center overflow-hidden"
        style={{ boxShadow: "0 8px 48px rgba(45,106,79,0.15)" }}
      >
        {/* Header bar */}
        <div className="w-full bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] px-6 pt-8 pb-6">
          <p className="text-white/70 text-xs font-medium tracking-widest uppercase mb-1">
            SegReClaim
          </p>
          <p className="text-white text-xl font-bold">Credit Redemption</p>
        </div>

        {/* Content area */}
        <div className="w-full px-6 pb-8 flex flex-col items-center gap-5">

          {/* ── Loading ── */}
          {pageState === "loading" && (
            <>
              <Loader2 size={40} className="text-[#74C69D] animate-spin" />
              <p className="text-[#6B7F6E] text-sm">Verifying token…</p>
            </>
          )}

          {/* ── Scanning ── */}
          {pageState === "scanning" && (
            <>
              <Camera size={44} className="text-[#2D6A4F] mt-2" />
              <div>
                <p className="font-bold text-[#1B2B1E] text-lg">Scan QR Code</p>
                <p className="text-sm text-[#6B7F6E] mt-1 mb-2">
                  Point your camera at the SegReClaim kiosk screen to scan your redemption code.
                </p>
              </div>
              <div className="w-full aspect-square overflow-hidden rounded-2xl bg-[#1B2B1E] relative border-4 border-[#D8F3DC]">
                <Scanner 
                  onScan={handleScan}
                  onError={(error: unknown) => console.error(error)}
                  components={{ finder: true }}
                />
              </div>
            </>
          )}

          {/* ── Invalid ── */}
          {pageState === "invalid" && (
            <>
              <AlertCircle size={44} className="text-red-400 mt-2" />
              <div>
                <p className="font-bold text-[#1B2B1E] text-lg">Invalid QR Code</p>
                <p className="text-sm text-[#6B7F6E] mt-1">
                  This link doesn&apos;t match any active redemption token.
                  Please scan the QR code on the kiosk screen again.
                </p>
              </div>
            </>
          )}

          {/* ── Expired ── */}
          {pageState === "expired" && (
            <>
              <Clock size={44} className="text-[#FB8500] mt-2" />
              <div>
                <p className="font-bold text-[#1B2B1E] text-lg">Token Expired</p>
                <p className="text-sm text-[#6B7F6E] mt-1">
                  This redemption token has expired (tokens are valid for 5 minutes).
                  Please deposit again at the kiosk to receive a fresh code.
                </p>
              </div>
              {tokenDoc && (
                <div className="w-full rounded-2xl bg-[#FFF8F0] border border-[#FFDDB5] px-4 py-3 text-sm text-[#B45309]">
                  <span className="font-semibold">
                    {CATEGORY_ICON[tokenDoc.category] ?? "♻️"}{" "}
                    {tokenDoc.weightGrams}g of{" "}
                    {CATEGORY_LABEL[tokenDoc.category] ?? tokenDoc.category}
                  </span>{" "}
                  — ₹{tokenDoc.credits.toFixed(2)} credits were not awarded.
                </div>
              )}
            </>
          )}

          {/* ── Already redeemed ── */}
          {pageState === "already_redeemed" && (
            <>
              <AlertCircle size={44} className="text-purple-400 mt-2" />
              <div>
                <p className="font-bold text-[#1B2B1E] text-lg">Already Redeemed</p>
                <p className="text-sm text-[#6B7F6E] mt-1">
                  These credits have already been claimed. Each QR code can only be
                  used once.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-xl bg-[#2D6A4F] text-white py-3 text-sm font-semibold
                           hover:bg-[#1B4332] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </>
          )}

          {/* ── Needs login ── */}
          {pageState === "needs_login" && (
            <>
              {tokenDoc && (
                <div className="w-full rounded-2xl bg-[#D8F3DC] px-4 py-4 mt-1">
                  <p className="text-xs text-[#2D6A4F] font-semibold uppercase tracking-wider mb-2">
                    Your Recycling
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl">
                      {CATEGORY_ICON[tokenDoc.category] ?? "♻️"}
                    </span>
                    <div className="text-left">
                      <p className="font-bold text-[#1B2B1E]">
                        {CATEGORY_LABEL[tokenDoc.category] ?? tokenDoc.category}
                      </p>
                      <p className="text-sm text-[#2D6A4F]">
                        {tokenDoc.weightGrams}g · <span className="font-bold">₹{tokenDoc.credits.toFixed(2)} credits</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <p className="font-bold text-[#1B2B1E] text-lg">
                  Sign in to claim your credits
                </p>
                <p className="text-sm text-[#6B7F6E] mt-1">
                  Log in and your recycling credits will be added to your account instantly.
                </p>
                {tokenDoc && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-[#6B7F6E]">
                    <Clock size={12} />
                    <span>Expires in {timeLeft()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                id="redeem-google-signin-btn"
                className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-[#D8F3DC]
                           bg-white px-4 py-3 text-[#1B2B1E] font-semibold text-sm
                           hover:border-[#74C69D] hover:bg-[#F8F4EF] active:scale-95
                           transition-all duration-150 disabled:opacity-60"
              >
                {signingIn ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {signingIn ? "Signing in…" : "Continue with Google"}
              </button>
            </>
          )}

          {/* ── Claiming in progress ── */}
          {pageState === "claiming" && (
            <>
              <div className="relative mt-2">
                <div className="w-20 h-20 rounded-full bg-[#D8F3DC] flex items-center justify-center">
                  <Leaf size={36} className="text-[#2D6A4F]" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-[#74C69D] border-t-transparent animate-spin" />
              </div>
              <div>
                <p className="font-bold text-[#1B2B1E] text-lg">Claiming your credits…</p>
                <p className="text-sm text-[#6B7F6E] mt-1">
                  Linking your recycling to your account.
                </p>
              </div>
            </>
          )}

          {/* ── Success ── */}
          {pageState === "claimed" && (
            <>
              <div className="relative mt-2">
                <div className="w-20 h-20 rounded-2xl bg-[#D8F3DC] flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-[#2D6A4F]" />
                </div>
              </div>

              <div>
                <p className="font-bold text-[#1B2B1E] text-xl">Credits Claimed! 🎉</p>
                <p className="text-sm text-[#6B7F6E] mt-1">
                  Your recycling has been recorded and credits are on their way.
                </p>
              </div>

              {tokenDoc && (
                <div className="w-full rounded-2xl bg-[#D8F3DC] px-5 py-4">
                  <p className="text-xs text-[#2D6A4F] font-semibold uppercase tracking-wider mb-3">
                    Recycling Summary
                  </p>
                  <div className="flex items-center gap-3 justify-center mb-3">
                    <span className="text-3xl">{CATEGORY_ICON[tokenDoc.category] ?? "♻️"}</span>
                    <div className="text-left">
                      <p className="font-bold text-[#1B2B1E]">
                        {CATEGORY_LABEL[tokenDoc.category] ?? tokenDoc.category}
                      </p>
                      <p className="text-sm text-[#2D6A4F]">{tokenDoc.weightGrams}g deposited</p>
                    </div>
                  </div>
                  <div className="border-t border-[#B7E4C7] pt-3">
                    <p className="text-xs text-[#2D6A4F] mb-1">Credits Earned</p>
                    <p className="text-3xl font-extrabold text-[#2D6A4F]">
                      ₹{creditsAwarded.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#74C69D] mt-1">≈ {Math.round(creditsAwarded)} pts</p>
                  </div>
                </div>
              )}

              {liveUserDoc && (
                <div className="w-full rounded-2xl bg-[#F8F4EF] px-4 py-3">
                  <p className="text-xs text-[#6B7F6E] mb-1">Your total balance</p>
                  <p className="text-2xl font-extrabold text-[#1B2B1E]">
                    {liveUserDoc.totalPoints.toLocaleString()}
                    <span className="text-base font-semibold text-[#6B7F6E] ml-1">pts</span>
                  </p>
                  <p className="text-xs text-[#74C69D] animate-pulse mt-0.5">Live · updating</p>
                </div>
              )}

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full rounded-xl bg-[#2D6A4F] text-white py-3 text-sm font-semibold
                           hover:bg-[#1B4332] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                View Dashboard <ArrowRight size={16} />
              </button>

              <button
                onClick={() => router.push("/rewards")}
                className="w-full rounded-xl border-2 border-[#D8F3DC] text-[#2D6A4F] py-2.5 text-sm font-semibold
                           hover:bg-[#D8F3DC] active:scale-95 transition-all"
              >
                Browse Rewards
              </button>
            </>
          )}

          {/* ── Error ── */}
          {pageState === "error" && (
            <>
              <AlertCircle size={44} className="text-red-400 mt-2" />
              <div>
                <p className="font-bold text-[#1B2B1E] text-lg">Something went wrong</p>
                <p className="text-sm text-[#6B7F6E] mt-1">{errorMsg}</p>
              </div>
              <button
                onClick={loadToken}
                className="w-full rounded-xl bg-[#2D6A4F] text-white py-3 text-sm font-semibold
                           hover:bg-[#1B4332] active:scale-95 transition-all"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
