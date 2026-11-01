import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Cửa hàng & Sản phẩm | iCards",
  description:
    "Thiệp in, phong bì, hộp quà, standee QR và gói tin nhắn cho đám cưới, sự kiện, đồng bộ với thiệp mời online.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopClient />
    </Suspense>
  );
}