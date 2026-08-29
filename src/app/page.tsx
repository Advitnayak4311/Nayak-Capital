import { Hero } from "@/components/home/Hero";
import { LoanCalculator } from "@/components/home/LoanCalculator";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { WhyNayak } from "@/components/home/WhyNayak";
import { FAQ } from "@/components/home/FAQ";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <LoanCalculator />
      <ProcessTimeline />
      <WhyNayak />
      <FAQ />
      <CtaBanner />
    </div>
  );
}
