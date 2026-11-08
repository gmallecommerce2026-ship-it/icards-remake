import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "@/lib/fonts";
import { AuthProvider } from "@/providers/AuthProvider";
import { UiThemeSwitcher } from "@/components/ui/UiThemeSwitcher";
import "./globals.css";
import "@/styles/local-fonts.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/playfair-display/700.css";

const be = Be_Vietnam_Pro({ subsets: ["vietnamese", "latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-be" });
const display = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-display-raw", display: "swap" });

export const metadata: Metadata = {
  title: "iCards – Thiệp cưới online & quản lý khách mời",
  description: "Thiết kế thiệp cưới online, gửi lời mời, theo dõi xác nhận tham dự và lời chúc trong một nơi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${be.variable} ${display.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var t=localStorage.getItem('icards:ui-theme');if(t&&/^[1-5]$/.test(t))document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
        <AuthProvider>
          {children}
          <UiThemeSwitcher />
        </AuthProvider>
      </body>
    </html>
  );
}
