import type { Metadata } from "next";
import TutorialPage from "@/components/professional/TutorialPage";

export const metadata: Metadata = {
  title: "Thiết kế chuyên nghiệp | iCards",
  description: "Giải pháp thiết kế thiệp điện tử độc quyền và vận hành công nghệ dành cho cá nhân cao cấp, doanh nghiệp và agency sự kiện.",
};

export default function ProfessionalPage() {
  return <TutorialPage />;
}
