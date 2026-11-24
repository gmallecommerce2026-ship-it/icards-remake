import type { ReactNode } from "react";
import { PageShell } from "@/components/shop/PageShell";

export default function ShopLayout({ children }: { children: ReactNode }) {
  // Banner đầu trang chỉ hiện ở trang danh sách (xem shop/page.tsx), không hiện ở trang chi tiết sản phẩm.
  return <PageShell>{children}</PageShell>;
}
