import type { Metadata } from "next";
import { HomepageContent } from "@/components/home/HomepageContent";

export const metadata: Metadata = {
  title: "iCards.com.vn: Nền Tảng Thiết Kế Thiệp Online",
  description: "Tạo thiệp mời, thiệp chúc mừng online đẹp mắt và chuyên nghiệp.",
  openGraph: { images: ["https://imagedelivery.net/mYCNH6-2h27PJijuhYd-fw/32c7501a-ed3b-4466-876b-48bcfb13d600/public"] },
};

export default function HomePage() {
  return <HomepageContent />;
}
