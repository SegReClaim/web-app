"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?from=/admin");
    if (!loading && user && !isAdmin) router.replace("/dashboard");
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2D6A4F]" size={36} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center p-4">
        <div
          className="max-w-sm w-full rounded-2xl bg-white p-8 text-center flex flex-col items-center gap-4"
          style={{ boxShadow: "0 4px 32px rgba(45,106,79,0.12)" }}
        >
          <ShieldAlert size={40} className="text-[#FB8500]" />
          <p className="font-semibold text-[#1B2B1E]">Admin access required</p>
          <p className="text-sm text-[#6B7F6E]">
            Your account does not have admin privileges. Set{" "}
            <code className="text-xs bg-[#D8F3DC] px-1 rounded">role: &quot;admin&quot;</code>{" "}
            on your user doc in Firestore.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
