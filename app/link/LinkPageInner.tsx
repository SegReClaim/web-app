"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { MapPin, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import PointsBadge from "@/components/ui/PointsBadge";
import {
  getSession,
  linkSession,
  createUserDoc,
  getMachine,
  subscribeToUserDoc,
} from "@/lib/firestore";
import { SessionDoc, MachineDoc, UserDoc } from "@/types";
import { friendlyError, formatDate } from "@/lib/utils";
import { Unsubscribe } from "firebase/firestore";

type PageState =
  | "loading"
  | "invalid"
  | "expired"
  | "already_claimed"
  | "needs_login"
  | "linking"
  | "linked"
  | "error";

export default function LinkPageInner() {
  const params = useSearchParams();
  const sessionToken = params.get("session");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [sessionDoc, setSessionDoc] = useState<SessionDoc | null>(null);
  const [machine, setMachine] = useState<MachineDoc | null>(null);
  const [liveUserDoc, setLiveUserDoc] = useState<UserDoc | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const unsubRef = useRef<Unsubscribe | null>(null);

  // ── Validate & load session ─────────────────────────────────
  const loadSession = useCallback(async () => {
    if (!sessionToken) {
      setPageState("invalid");
      return;
    }
    setPageState("loading");
    try {
      const session = await getSession(sessionToken);

      if (!session) {
        setPageState("invalid");
        return;
      }

      const now = new Date();
      if (session.expiresAt.toDate() < now) {
        setPageState("expired");
        setSessionDoc(session);
        return;
      }

      if (
        session.status !== "pending" &&
        session.userId &&
        session.userId !== user?.uid
      ) {
        setPageState("already_claimed");
        setSessionDoc(session);
        return;
      }

      setSessionDoc(session);

      // Fetch machine details
      const m = await getMachine(session.machineId);
      setMachine(m);

      if (authLoading) return; // wait for Firebase auth to resolve

      if (!user) {
        setPageState("needs_login");
      } else {
        await performLink(session, user.uid, user.displayName ?? "Recycler");
      }
    } catch (e) {
      setErrorMsg(friendlyError(e));
      setPageState("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, user, authLoading]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Subscribe to live user doc updates after linking
  useEffect(() => {
    if (pageState === "linked" && user) {
      unsubRef.current = subscribeToUserDoc(user.uid, setLiveUserDoc);
    }
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [pageState, user]);

  // ── Link session to user ────────────────────────────────────
  async function performLink(session: SessionDoc, uid: string, displayName: string) {
    setPageState("linking");
    try {
      await createUserDoc(uid, displayName);
      await linkSession(session.sessionId, uid);
      setPageState("linked");
    } catch (e) {
      setErrorMsg(friendlyError(e));
      setPageState("error");
    }
  }

  // ── Google Sign-In ──────────────────────────────────────────
  async function handleGoogleSignIn() {
    if (!sessionDoc) return;
    setSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await performLink(
        sessionDoc,
        result.user.uid,
        result.user.displayName ?? "Recycler"
      );
    } catch (e) {
      setErrorMsg(friendlyError(e));
      setPageState("error");
    } finally {
      setSigningIn(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 flex flex-col items-center gap-5 text-center"
        style={{ boxShadow: "0 4px 32px rgba(45,106,79,0.12)" }}
      >
        {/* Wordmark */}
        <div>
          <p className="text-xl font-bold text-[#1B2B1E]">SegReClaim</p>
          <p className="text-xs text-[#6B7F6E]">Segregate · Recycle · Reward</p>
        </div>

        {/* Loading */}
        {pageState === "loading" && (
          <>
            <Loader2 size={40} className="text-[#74C69D] animate-spin" />
            <p className="text-[#6B7F6E] text-sm">Verifying machine session…</p>
          </>
        )}

        {/* Invalid token */}
        {pageState === "invalid" && (
          <>
            <AlertCircle size={40} className="text-red-400" />
            <div>
              <p className="font-semibold text-[#1B2B1E]">Invalid QR Code</p>
              <p className="text-sm text-[#6B7F6E] mt-1">
                This link doesn&apos;t match any active machine session. Please
                scan the QR code on the machine screen again.
              </p>
            </div>
          </>
        )}

        {/* Expired session */}
        {pageState === "expired" && (
          <>
            <AlertCircle size={40} className="text-[#FB8500]" />
            <div>
              <p className="font-semibold text-[#1B2B1E]">Session Expired</p>
              <p className="text-sm text-[#6B7F6E] mt-1">
                This session expired on{" "}
                {sessionDoc ? formatDate(sessionDoc.expiresAt) : "—"}.
                Please scan a fresh QR code at the machine.
              </p>
            </div>
          </>
        )}

        {/* Already claimed by someone else */}
        {pageState === "already_claimed" && (
          <>
            <AlertCircle size={40} className="text-[#8338EC]" />
            <div>
              <p className="font-semibold text-[#1B2B1E]">Already Linked</p>
              <p className="text-sm text-[#6B7F6E] mt-1">
                This session is already linked to another account. Scan a new
                QR code to start a fresh session.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-xl bg-[#2D6A4F] text-white py-2.5 text-sm font-semibold
                         hover:bg-[#1B4332] active:scale-95 transition-all"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {/* Needs login */}
        {pageState === "needs_login" && (
          <>
            <div className="flex flex-col items-center gap-2">
              {machine && (
                <div className="flex items-center gap-1.5 text-xs text-[#6B7F6E] bg-[#D8F3DC] rounded-xl px-3 py-1.5">
                  <MapPin size={12} />
                  <span>{machine.locationName}</span>
                </div>
              )}
              <p className="font-semibold text-[#1B2B1E] text-lg">
                Sign in to start recycling
              </p>
              <p className="text-sm text-[#6B7F6E]">
                You&apos;ll be linked to the machine and ready to deposit waste.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              id="link-google-signin-btn"
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

        {/* Linking in progress */}
        {pageState === "linking" && (
          <>
            <Loader2 size={40} className="text-[#2D6A4F] animate-spin" />
            <p className="text-[#6B7F6E] text-sm">Linking you to the machine…</p>
          </>
        )}

        {/* Linked success */}
        {pageState === "linked" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-[#D8F3DC] flex items-center justify-center">
              <CheckCircle size={32} className="text-[#2D6A4F]" />
            </div>
            <div>
              <p className="font-bold text-[#1B2B1E] text-xl">You&apos;re linked! 🎉</p>
              <p className="text-sm text-[#6B7F6E] mt-1">
                Insert your recyclable waste to begin earning points.
              </p>
            </div>

            {machine && (
              <div className="w-full rounded-xl bg-[#D8F3DC] px-4 py-3">
                <div className="flex items-center gap-1.5 justify-center text-sm font-semibold text-[#2D6A4F]">
                  <MapPin size={14} />
                  {machine.locationName}
                </div>
                <p className="text-xs text-[#6B7F6E] mt-0.5 capitalize">
                  Status:{" "}
                  <span
                    className={
                      machine.status === "online"
                        ? "text-[#2D6A4F] font-semibold"
                        : "text-[#FB8500] font-semibold"
                    }
                  >
                    {machine.status}
                  </span>
                </p>
              </div>
            )}

            {liveUserDoc && (
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-[#6B7F6E]">Your balance</p>
                <PointsBadge points={liveUserDoc.totalPoints} size="lg" animate />
                <p className="text-xs text-[#74C69D] animate-pulse">
                  Live · updates as you deposit
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-xl border-2 border-[#2D6A4F] text-[#2D6A4F] font-semibold
                         py-2.5 text-sm hover:bg-[#D8F3DC] active:scale-95 transition-all"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {/* Error state */}
        {pageState === "error" && (
          <>
            <AlertCircle size={40} className="text-red-400" />
            <div>
              <p className="font-semibold text-[#1B2B1E]">Something went wrong</p>
              <p className="text-sm text-[#6B7F6E] mt-1">{errorMsg}</p>
            </div>
            <button
              onClick={loadSession}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F]
                         text-white py-2.5 text-sm font-semibold
                         hover:bg-[#1B4332] active:scale-95 transition-all"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
