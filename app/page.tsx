import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { WaitlistSection } from "@/components/landing/WaitlistSection";
import { FAQSection } from "@/components/landing/FAQSection";

export default function Home() {
  return (
    <main className="relative w-full">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <WaitlistSection />
      <FAQSection />
    </main>
  );
}
