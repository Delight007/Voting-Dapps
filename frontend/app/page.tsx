import CTABanner from "./components/cta";
import FeaturesSection from "./components/features";
import HeroSection from "./components/hero";
import HowItWorksSection from "./components/how";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 overflow-x-hidden font-sans">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTABanner />
    </div>
  );
}
