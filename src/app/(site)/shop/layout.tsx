import type { ReactNode } from "react";
import { CartProvider } from "@/components/shop/CartProvider";
import { PageShell } from "@/components/shop/PageShell";
import { ShopBar } from "@/components/shop/ShopBar";
import { getProducts } from "@/lib/catalog";
import { SHOP_BANNERS } from "@/lib/banners";
import { Carousel } from "@/components/ui/Carousel";
import { Container } from "@/components/ui/Primitives";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  // Giỏ hàng cần danh mục sản phẩm để kiểm tra và hiển thị dòng hàng đã lưu
  const products = await getProducts();
  return (
    <CartProvider products={products}>
      <PageShell>
        <div className="pt-[72px]">
          <Container className="pt-6">
            <Carousel slides={SHOP_BANNERS} />
          </Container>
          <ShopBar />
          {children}
        </div>
      </PageShell>
    </CartProvider>
  );
}
