import { Hero } from "@/components/home/Hero";
import { Stats, Features, Steps, Templates, Testimonials, FinalCta } from "@/components/home/Sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Steps />
      <Templates />
      <Testimonials />
      <FinalCta />
    </>
  );
}
