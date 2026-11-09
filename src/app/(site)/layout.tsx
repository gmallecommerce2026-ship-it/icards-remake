import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { PersonalizePanel } from "@/components/personalize/PersonalizePanel";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <PersonalizePanel />
      <WelcomePopup />
    </>
  );
}
