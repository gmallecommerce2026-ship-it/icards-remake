import type { ReactNode } from "react";
import { PageShell } from "@/components/shop/PageShell";
import { SERVICES_BANNERS } from "@/lib/banners";
import { HeroCarousel } from "@/components/ui/HeroCarousel";

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      <div>
        <HeroCarousel slides={SERVICES_BANNERS} />
        {children}
      </div>
    </PageShell>
  );
}
