import type { ReactNode } from "react";
import { CartProvider } from "@/components/shop/CartProvider";
import { PageShell } from "@/components/shop/PageShell";
import { ShopBar } from "@/components/shop/ShopBar";
import { getProducts } from "@/lib/catalog";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  // Giỏ hàng cần danh mục sản phẩm để kiểm tra và hiển thị dòng hàng đã lưu
  const products = await getProducts();
  return (
    <CartProvider products={products}>
      <PageShell>
        <div className="pt-[72px]">
          <ShopBar />
          {children}
        </div>
      </PageShell>
    </CartProvider>
  );
}
