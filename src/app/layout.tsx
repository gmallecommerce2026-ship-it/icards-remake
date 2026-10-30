import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const be = Be_Vietnam_Pro({ subsets: ["vietnamese", "latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-be" });

export const metadata: Metadata = {
  title: "iCards – Thiệp cưới online & quản lý khách mời",
  description: "Thiết kế thiệp cưới online, gửi lời mời, theo dõi xác nhận tham dự và lời chúc trong một nơi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${be.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
