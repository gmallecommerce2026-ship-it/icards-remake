import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";

export const metadata: Metadata = { title: "Giỏ hàng | iCards" };

export default function CartPage() {
  return <CartView />;
}
