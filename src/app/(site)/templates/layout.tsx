import type { ReactNode } from "react";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "@/lib/fonts";

// Font và màu lấy từ theme chung (globals.css). Layout này chỉ nạp font tiếng Việt cho trang mẫu.
const ui = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tpl-ui",
  display: "swap",
});
const display = Cormorant_Garamond({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-tpl-display",
  display: "swap",
});

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${ui.variable} ${display.variable} min-h-screen bg-porcelain text-ink`}>
      {children}
    </div>
  );
}
