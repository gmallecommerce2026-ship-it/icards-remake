import type { Metadata } from "next";
import { getTemplates } from "@/lib/templates";
import { TemplateBrowser } from "@/components/templates/TemplateBrowser";
import { PageHero, Container } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Mẫu thiệp mời online",
  description:
    "Chọn mẫu thiệp cưới, sinh nhật, đầy tháng và sự kiện. Xem trước trên điện thoại, điền thông tin và gửi link cho khách mời.",
};

export default function TemplatesPage() {
  const templates = getTemplates();
  return (
    <main className="min-h-screen bg-porcelain">
      <PageHero 
        title="Mẫu thiệp mời"
        description="Chọn một mẫu, điền thông tin sự kiện, rồi gửi link cho khách mời. Mẫu nào cũng xem trước được ngay như khách sẽ thấy trên điện thoại."
      />
      <Container className="py-10 sm:py-14">
        <TemplateBrowser templates={templates} />
      </Container>
    </main>
  );
}