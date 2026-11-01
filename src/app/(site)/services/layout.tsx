import type { ReactNode } from "react";
import { CartProvider } from "@/components/shop/CartProvider";
import { PageShell } from "@/components/shop/PageShell";
import { ShopBar } from "@/components/shop/ShopBar";

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <PageShell>
        <div className="pt-[72px]">
          <ShopBar />
          {children}
        </div>
      </PageShell>
    </CartProvider>
  );
}
