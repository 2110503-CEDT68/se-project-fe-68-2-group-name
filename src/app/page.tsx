import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import CTASection from "@/components/CTAsection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhyChooseSection />
      <CTASection />
    </main>
  );
}
