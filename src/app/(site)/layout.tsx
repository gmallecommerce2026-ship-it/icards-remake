import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { SideAdsShell } from "@/components/ads/SideAdsShell";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // overflow-x-clip ở wrapper toàn chiều rộng: hero full-bleed (100vw) không gây thanh cuộn ngang
  return (
    <div className="overflow-x-clip">
      <Header />
      <SideAdsShell>
        <main>{children}</main>
      </SideAdsShell>
      <Footer />
      <WelcomePopup />
    </div>
  );
}
