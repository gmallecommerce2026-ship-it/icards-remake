import type { ReactNode } from "react";
import { PageShell } from "@/components/shop/PageShell";
import { SHOP_BANNERS } from "@/lib/banners";
import { HeroCarousel } from "@/components/ui/HeroCarousel";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      <div>
        <HeroCarousel slides={SHOP_BANNERS} />
        {children}
      </div>
    </PageShell>
  );
}
