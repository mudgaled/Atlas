import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import VerifiedPartnersSection from "@/components/VerifiedPartnersSection";
import GlobalSearchSection from "@/components/GlobalSearchSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import LogisticsSection from "@/components/LogisticsSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSection />
      <VerifiedPartnersSection />
      <GlobalSearchSection />
      <FeaturesGrid />
      <LogisticsSection />
      <CTASection />
    </main>
  );
};

export default Index;
