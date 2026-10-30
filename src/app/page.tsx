import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Stats, Features, Steps, Templates, Testimonials, FinalCta } from "@/components/home/Sections";
import { Footer } from "@/components/home/Footer";
import { ImmersiveScrollHero } from "@/components/home/ImmersiveScrollHero";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <ImmersiveScrollHero />
        <Hero />
        <Stats />
        <Features />
        <Steps />
        <Templates />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
