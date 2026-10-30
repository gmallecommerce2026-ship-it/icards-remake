import type { ReactNode } from "react";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";

// Be Vietnam Pro cho giao diện, Cormorant Garamond cho chữ trên thiệp. Cả hai có subset tiếng Việt.
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

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${ui.variable} ${display.variable} min-h-screen bg-[#F6F8FB] text-[#0E1B2C] [font-family:var(--font-tpl-ui),system-ui,sans-serif]`}
    >
      {children}
    </div>
  );
}
