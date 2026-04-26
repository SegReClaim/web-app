import { WasteType } from "@/types";

// ── Date formatting ─────────────────────────────────────────────
import { Timestamp } from "firebase/firestore";

export function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  const date = ts.toDate();
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  const date = ts.toDate();
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  return `${formatDate(ts)}, ${formatTime(ts)}`;
}

// ── Points formatting ────────────────────────────────────────────
export function formatPoints(points: number): string {
  if (points >= 1_000_000) return `${(points / 1_000_000).toFixed(1)}M`;
  if (points >= 1_000) return `${(points / 1_000).toFixed(1)}K`;
  return points.toLocaleString("en-IN");
}

// ── Weight formatting ────────────────────────────────────────────
export function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${grams}g`;
}

// ── CO2 calculation ──────────────────────────────────────────────
/** Uses 2.5 kg CO2 saved per kg of material recycled */
export function calculateCO2(totalWeightGrams: number): number {
  return Math.round((totalWeightGrams / 1000) * 2.5 * 10) / 10;
}

// ── Waste type metadata ──────────────────────────────────────────
export const WASTE_COLORS: Record<WasteType, string> = {
  plastic: "#3A86FF",
  glass: "#8338EC",
  aluminium: "#FF6B35",
  paper: "#FB8500",
  metal: "#9AA0A6",
  general: "#78909C",
};

export const WASTE_BG_COLORS: Record<WasteType, string> = {
  plastic: "#EBF3FF",
  glass: "#F0EAFF",
  aluminium: "#FFF0EA",
  paper: "#FFF5E5",
  metal: "#F1F3F4",
  general: "#ECEFF1",
};

export const WASTE_LABELS: Record<WasteType, string> = {
  plastic: "Plastic",
  glass: "Glass",
  aluminium: "Aluminium",
  paper: "Paper",
  metal: "Metal",
  general: "General",
};

export const WASTE_EMOJIS: Record<WasteType, string> = {
  plastic: "🧴",
  glass: "🍾",
  aluminium: "🥫",
  paper: "📄",
  metal: "🔩",
  general: "🗑️",
};

// ── Animated counter ─────────────────────────────────────────────
/**
 * Animates a number counting from `from` to `to` over `duration` ms.
 * Calls `onUpdate` with each intermediate value.
 * Returns a cleanup function.
 */
export function animateCounter(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onDone?: () => void
): () => void {
  const start = performance.now();
  let raf: number;

  const step = (now: number) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * eased);
    onUpdate(current);
    if (progress < 1) {
      raf = requestAnimationFrame(step);
    } else {
      onUpdate(to);
      onDone?.();
    }
  };

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

// ── Voucher expiry helper ────────────────────────────────────────
export function isExpired(ts: Timestamp): boolean {
  return ts.toDate() < new Date();
}

export function daysUntilExpiry(ts: Timestamp): number {
  const now = new Date();
  const exp = ts.toDate();
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Firebase error messages ──────────────────────────────────────
const FIREBASE_ERROR_MAP: Record<string, string> = {
  "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "functions/unauthenticated": "You need to be logged in to do that.",
  "functions/not-found": "The requested item could not be found.",
  "functions/resource-exhausted": "This reward is out of stock.",
  "functions/failed-precondition": "You don't have enough points for this reward.",
  "functions/internal": "Something went wrong on our end. Please try again.",
};

export function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? "";
    return FIREBASE_ERROR_MAP[code] ?? err.message ?? "An unexpected error occurred.";
  }
  return "An unexpected error occurred.";
}
