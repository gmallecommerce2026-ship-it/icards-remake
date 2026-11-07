import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { getProducts, getShopCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cửa hàng & Sản phẩm | iCards",
  description:
    "Thiệp in, phong bì, hộp quà, standee QR và gói tin nhắn cho đám cưới, sự kiện, đồng bộ với thiệp mời online.",
};

export default async function Page() {
  const [products, categories] = await Promise.all([getProducts(), getShopCategories()]);
  return (
    <Suspense fallback={null}>
      <ShopClient products={products} categories={categories} />
    </Suspense>
  );
}
