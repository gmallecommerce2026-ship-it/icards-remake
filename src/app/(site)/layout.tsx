import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { SideAdsShell } from "@/components/ads/SideAdsShell";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <SideAdsShell>
        <main>{children}</main>
      </SideAdsShell>
      <Footer />
      <WelcomePopup />
    </>
  );
}
