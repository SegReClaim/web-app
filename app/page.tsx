import LandingNavbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import WasteTypes from "@/components/landing/WasteTypes";
import ImpactCounter from "@/components/landing/ImpactCounter";
import RewardsPreview from "@/components/landing/RewardsPreview";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "SegReClaim — Recycle. Earn. Repeat.",
  description:
    "Deposit recyclable waste at any SegReClaim kiosk, earn points, and redeem rewards with partner brands. Now live in Surat.",
};

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      {/* Sticky landing navbar (separate from the app navbar) */}
      <LandingNavbar />

      {/* Hero — full viewport, dark green with particles */}
      <HeroSection />

      {/* How it works — cream bg */}
      <HowItWorks />

      {/* What we accept — white bg */}
      <WasteTypes />

      {/* Impact counters — primary green bg */}
      <ImpactCounter />

      {/* Rewards preview — cream bg */}
      <RewardsPreview />

      {/* Final CTA — darkest green with particles */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
