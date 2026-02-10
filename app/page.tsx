import { HeroSection } from "@/src/landing/components/HeroSection";
import { WhatIsSection } from "@/src/landing/components/WhatIsSection";
import { ForWhoSection } from "@/src/landing/components/ForWhoSection";
import { HowItWorksSection } from "@/src/landing/components/HowItWorksSection";
import { PricingSection } from "@/src/landing/components/PricingSection";
import { AppStoresSection } from "@/src/landing/components/AppStoresSection";
import { FinalCTASection } from "@/src/landing/components/FinalCTASection";
import { FooterSection } from "@/src/landing/components/FooterSection";

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <WhatIsSection />
        <ForWhoSection />
        <HowItWorksSection />
        <PricingSection />
        <AppStoresSection />
        <FinalCTASection />
      </main>
      <FooterSection />
    </>
  );
}
