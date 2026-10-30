import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Cửa hàng & Sản phẩm | iCards",
  description:
    "Thiệp in, quà tặng, thẻ NFC, standee QR và combo cho đám cưới, sự kiện. Đặt hàng nhanh, đồng bộ với thiệp mời online.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopClient />
    </Suspense>
  );
}