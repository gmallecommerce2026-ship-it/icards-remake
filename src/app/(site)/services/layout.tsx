import type { ReactNode } from "react";
import { CartProvider } from "@/components/shop/CartProvider";
import { PageShell } from "@/components/shop/PageShell";
import { ShopBar } from "@/components/shop/ShopBar";
import { getProducts } from "@/lib/catalog";
import { SERVICES_BANNERS } from "@/lib/banners";
import { Carousel } from "@/components/ui/Carousel";
import { Container } from "@/components/ui/Primitives";

export default async function ServicesLayout({ children }: { children: ReactNode }) {
  // Giỏ hàng cần danh mục sản phẩm để kiểm tra và hiển thị dòng hàng đã lưu
  const products = await getProducts();
  return (
    <CartProvider products={products}>
      <PageShell>
        <div>
          <Container className="pt-6">
            <Carousel slides={SERVICES_BANNERS} />
          </Container>
          <ShopBar />
          {children}
        </div>
      </PageShell>
    </CartProvider>
  );
}
