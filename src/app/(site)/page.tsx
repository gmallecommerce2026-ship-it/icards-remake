import { Hero } from "@/components/home/Hero";
import { Stats, Features, Steps, Templates, Testimonials, FinalCta } from "@/components/home/Sections";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { AboutUs } from "@/components/home/AboutUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Steps />
      <Templates />
      <HomeCarousel />
      <Testimonials />
      <FinalCta />
      <AboutUs />
    </>
  );
}
