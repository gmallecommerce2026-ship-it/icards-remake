"use client";

/* Mã nguồn giữ theo TutorialPage.js của bản src; CSS ở TutorialPage.css (cùng tên class). */

import Link from "next/link";
import { useEffect, useState } from "react";
import { settingsApi, templatesApi } from "@/lib/api";
import { templatesOf } from "@/lib/api/list";
import type { InvitationTemplate } from "@/lib/templates";
import { TemplateShowcase } from "@/components/templates/TemplateShowcase";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { BannerCard } from "@/components/ui/BannerCard";
import type { Slide } from "@/components/ui/Carousel";
import { PROFESSIONAL_BANNERS, PROFESSIONAL_BOTTOM_BANNERS } from "@/lib/banners";
import "./TutorialPage.css";

type Template = InvitationTemplate & { _id: string; title: string; imgSrc?: string };
type Banner = { displayPage?: string; isEnabled?: boolean; imageUrl?: string; title?: string; subtitle?: string; link?: string; mediaType?: string; videoUrl?: string; htmlContent?: string };


const FAQ = [
  { q: "Thiệp mời online là gì?", a: "Thiệp mời online là thiệp mời trên nền tảng số trực tuyến, thay vì được in ra giấy như các tấm thiệp mời truyền thống. Sau khi tạo thiệp mời online, bạn sẽ gửi tấm thiệp tới khách mời thông qua tin nhắn hoặc mạng xã hội như Facebook, Zalo,... Khi đó, khách mời chỉ cần có kết nối Internet là đã có thể xem được tấm thiệp mời của bạn." },
  { q: "Thiệp mời online và thiệp mời truyền thống khác nhau thế nào?", a: "Thiệp mời online và thiệp mời truyền thống có nhiều điểm khác biệt, chủ yếu ở hình thức, thiết kế, cách truyền tải thông tin đám cưới và cách gửi thiệp:\n\n1. Với thiệp mời truyền thống: Là thiệp in giấy, với những thiết kế phổ thông, khó thay đổi theo mong muốn cá nhân, chi phí in ấn cao, hình thức gửi thiệp là Tay Trao Tay cho khách mời. Với thời đại công nghệ hiện nay, đa phần mọi người bắt đầu sử dụng thiệp bán online, ví dụ như: Chụp hình thiệp truyền thống để gửi tin nhắn hoặc mạng xã hội cho khách mời, hoặc tự thiết kế rồi xuất thành hình ảnh rồi gửi online cho khách mời.\n\n2. Với thiệp mời online: Là thiệp bạn có thể tự mình thiết kế trên nền tảng thiết kế thiệp mời online, với đa dạng mẫu thiết kế, và cá nhân hoá thiệp mời theo những gì bạn thích. Không cần phải in ấn nên tiết kiệm chi phí. Có tính năng quản lý danh sách khách mời, và gửi thiệp mời cho từng khách bằng một liên kết online thông qua internet như tin nhắn, Facebook, Zalo,..." },
  { q: "Lợi ích của thiệp mời online là gì?", a: "Không đơn thuần là một tấm thiệp, thiệp mời online là một sự kết hợp hoàn hảo với nền tảng số.\n\nCá nhân hóa thiết kế, để sự kiện trở nên ấn tượng hơn. Tiết kiệm chi phí in ấn thiệp mời, góp phần bảo vệ môi trường. Quản lý thông tin khách mời dễ dàng và cho phép khách mời có thể xác nhận tham dự, giúp bạn kế hoạch cho sự kiện chu toàn hơn. Dễ dàng gửi thiệp mời qua Facebook, Zalo, SMS hoặc bằng mail thông qua internet cho tất cả khách mời." },
  { q: "Tôi có thể đặt in thiệp mời được không?", a: "Được, bạn có thể thiết kế thiệp mời, và trực tiếp đặt in trên nền tảng invitePro. Chúng tôi cung cấp dịch vụ In ấn chất lượng - Chuyển thiệp tận nơi. Chúng tôi giúp bạn biến những thiết kế của bạn thành những tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền!.\n\nNgoài ra, bạn cũng có thể tải xuống bản thiết kế, sau đó có thể đặt in ở bất kỳ nhà in ấn thiệp mời nào mà bạn muốn." },
  { q: "Thời gian in và nhận thiệp bao lâu?", a: "Thời gian in và nhận thiệp sẽ tuỳ thuộc vào loại thiệp bạn chọn (giấy in, chi tiết trên thiệp, cách điệu thiệp, v.v) và địa điểm giao nhận thiệp. Thông thường bạn sẽ nhận được thiệp sau 7 -10 ngày đặt in. Trong trường hợp, bạn cần in thiệp gấp, vui lòng liên hệ admin để được hỗ trợ." },
];

const SectionHeader = ({ title, subtitle, textAlign = "center" }: { title: string; subtitle?: string; textAlign?: "center" | "left" }) => (
  <div className={`section-header-pro ${textAlign}`}>
    <h2 className="section-title-pro">{title}</h2>
    {subtitle && <p className="section-subtitle-pro">{subtitle}</p>}
  </div>
);

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <div className="feature-card-pro">
    <div className="feature-icon-pro">
      <img src={`https://placehold.co/24x24/27548A/FFFFFF?text=${title.charAt(0)}`} alt={`${title} icon`} />
    </div>
    <div className="feature-content-pro">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

const HowItWorksStep = ({ number, title }: { number: string; title: string }) => (
  <div className="print-process-step-pro">
    <div className="step-number-pro">{number}</div>
    <div className="step-title-pro">{title}</div>
  </div>
);

const FaqItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <div className={`faq-item-pro ${isOpen ? "open" : ""}`}>
    <div className="faq-question-pro" onClick={onClick}>
      <h4>{question}</h4>
      <svg className="faq-toggle-pro" width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L7 7L13 1" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    {isOpen && (
      <div className="faq-answer-pro">
        <p>{answer}</p>
      </div>
    )}
  </div>
);

/* Thẻ mẫu thiệp: cùng kiểu với trang chủ và trang mẫu thiệp (xem trước thiệp + tên mẫu) */
const TEMPLATE_NAME_STYLE = {
  fontFamily: "var(--font-tpl-display), Georgia, serif",
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.25,
  color: "#0E1B2C",
} as const;

const ProTemplateCard = ({ template }: { template: Template }) => (
  <Link
    href={`/templates/${template.slug}`}
    className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A]"
  >
    <TemplateShowcase template={template} />
    <h3 style={TEMPLATE_NAME_STYLE} className="mt-3 truncate text-center group-hover:underline group-hover:underline-offset-4">
      {template.title}
    </h3>
  </Link>
);

/* Banner đầu trang: lấy từ CMS (displayPage professional / all) nếu có, không thì dùng bộ mặc định */
function heroSlidesFrom(banners: Banner[]): Slide[] {
  const cms = banners
    .filter((b) => b.isEnabled && (b.displayPage === "professional" || b.displayPage === "all") && b.title)
    .map((b, i) => ({
      id: `cms-${i}`,
      title: b.title ?? "",
      text: b.subtitle,
      image: b.imageUrl,
      href: b.link,
      cta: b.link ? "Khám phá" : undefined,
      tone: "",
    }));
  return cms.length ? cms : PROFESSIONAL_BANNERS;
}

export default function TutorialPage() {
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showcaseTemplates, setShowcaseTemplates] = useState<Template[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerSecondary, setBannerSecondary] = useState("https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herotutorial.png");

  useEffect(() => {
    settingsApi
      .getPublicSettings()
      .then((res) => {
        const s = res.data?.data ?? res.data ?? {};
        setBanners(s.banners ?? []);
        const sec = s.banners?.professional_secondary_1?.imageUrl;
        if (sec) setBannerSecondary(sec);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [showcaseRes, allRes] = await Promise.all([templatesApi.getTemplates({ limit: 10 }), templatesApi.getTemplates({ limit: 50 })]);
        const showcaseAll = templatesOf(showcaseRes.data) as unknown as Template[];
        const uniq = [...new Set(showcaseAll.map((t) => t.category))];
        setShowcaseTemplates(uniq.map((c) => showcaseAll.find((t) => t.category === c)).filter(Boolean) as unknown as Template[]);

        const allData = templatesOf(allRes.data) as unknown as Template[];
        const cats = [...new Set(allData.map((t) => t.category).filter(Boolean))];
        setAllCategories(cats);
        if (cats.length) setActiveCategory(cats[0]);
        else setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeCategory) return;
    templatesApi
      .getTemplates({ category: activeCategory, limit: 8 })
      .then((res) => setTemplates(templatesOf(res.data) as unknown as Template[]))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);
  const heroSlides = heroSlidesFrom(banners);

  return (
    <div className="pro-page-wrapper">
      <HeroCarousel slides={heroSlides} />

      <main className="pro-page-content">
        <section className="features-pro-section">
          <SectionHeader title="các tính năng thiệp mời pro" />
          <div className="features-pro-grid">
            <div className="feature-card-column">
              <FeatureCard title="Trang thông tin cưới" description="Trang web thể hiện đầy đủ thông tin cần thiết cho đám cưới, bao gồm sự kiện cưới, thông tin dâu rể, chuyện tình yêu và album ảnh cưới. Lưu giữ kỷ niệm và chia sẻ với bạn bè, người thân." />
              <FeatureCard title="Danh sách khách mời" description="Lên danh sách và quản lý thông tin khách mời giúp bạn dễ dàng xác định được số lượng người tham dự, tính toán chi phí phù hợp cho đám cưới của mình." />
              <FeatureCard title="Kế hoạch cưới" description="Tạo và theo dõi công việc cho ngày trọng đại của bạn, đảm bảo mọi thứ theo kế hoạch, cho đám cưới của bạn được vẹn toàn." />
            </div>
            <img src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f1.png" alt="Tính năng thiệp mời" className="main-image-pro" />
            <div className="feature-card-column">
              <FeatureCard title="Ngân sách cưới" description="Lập kế hoạch tài chính chi tiết và quản lý chi tiêu một cách thông minh. Tối ưu hóa ngân sách và đảm bảo rằng bạn có thể tận hưởng ngày cưới mà không cần lo lắng về tài chính." />
              <FeatureCard title="Thiệp cưới online" description="Tự tay thiết kế và gửi thiệp cưới online độc đáo. Với những mẫu thiệp chuyên nghiệp, bạn có thể gửi thiệp một cách dễ dàng và hiện đại, trong khi đó vẫn thể hiện sự trọn vẹn với khách mời của bạn." />
              <FeatureCard title="Gửi lời chúc" description="Cho phép bạn bè gửi lời chúc mừng, và lưu giữ mãi mãi. Thật tuyệt vời nếu 10 năm, 20 năm sau bạn vẫn còn nhớ những ai và nói những lời ấm áp nhất của ngày trọng đại." />
            </div>
          </div>
        </section>

        <section className="category-showcase-section mx-auto w-full max-w-[1520px] px-5 lg:px-8">
          <SectionHeader title="Dễ dàng tạo thiệp mời từ vô vàn mẫu thiệp có sẵn" subtitle="Những mẫu thiệp đẹp, chuyên nghiệp và cá nhân hoá, cho ngày trọng đại thêm nhiều ý nghĩa." />
          <div className="grid w-full grid-cols-4 gap-x-6 gap-y-10 max-[1200px]:grid-cols-3 max-[993px]:grid-cols-2 max-[769px]:gap-x-4 max-[769px]:gap-y-8 max-[577px]:grid-cols-1">
            {showcaseTemplates.map((t) => <ProTemplateCard key={t._id} template={t} />)}
          </div>
        </section>

        <section className="print-process-section-pro">
          <div className="print-process-content-pro">
            <SectionHeader title="In ấn chất lượng Chuyển thiệp tận nơi" subtitle="Chúng tôi giúp bạn biến những thiết kế của bạn thành những tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền!" textAlign="left" />
            <div className="print-process-steps-pro">
              <HowItWorksStep number="1" title="Chọn mẫu thiệp" />
              <HowItWorksStep number="2" title="Chỉnh sửa" />
              <HowItWorksStep number="3" title="Đặt in" />
              <HowItWorksStep number="4" title="Nhận thiệp" />
            </div>
            <p className="print-process-note-pro">Lưu ý: Thời gian nhận thiệp sẽ tuỳ thuộc vào địa điểm nhận hàng, thông thường mất 7 -10 ngày (bao gồm 2-3 ngày in), không bao gồm thời gian phát sinh khác</p>
          </div>
          <div className="print-process-image-pro">
            <img src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f2.png" alt="Quy trình in ấn" />
          </div>
        </section>

        <section className="download-section-pro">
          <SectionHeader title="Tải xuống bản thiết kế của bạn" subtitle="Cho phép bạn tải xuống bản thiết kế thiệp mời của bạn, và bạn có thể đặt in bất kỳ nơi nào bạn muốn" />
          <img src={bannerSecondary} alt="Mẫu thiết kế thiệp" />
          <p className="download-note-pro">Lưu ý: Chúng tôi không giải quyết các vấn đề in ấn ở địa điểm khác ngoài nhà cung cấp mà chúng tôi gợi ý.</p>
        </section>

        <section className="template-discovery-section">
          <div className="related-categories-pro">
            {allCategories.map((item) => (
              <button key={item} className={`category-button-pro ${activeCategory === item ? "active" : ""}`} onClick={() => setActiveCategory(item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="mx-auto grid w-full max-w-[1520px] grid-cols-4 gap-x-6 gap-y-10 px-5 max-[1200px]:grid-cols-3 max-[993px]:grid-cols-2 max-[769px]:gap-x-4 max-[769px]:gap-y-8 max-[577px]:grid-cols-1 lg:px-8">
            {loading && !templates.length ? (
              <p className="col-span-full text-center text-[#666]">Đang tải...</p>
            ) : (
              templates.map((t) => <ProTemplateCard key={t._id} template={t} />)
            )}
          </div>
          <button className="view-more-btn-pro">XEM THÊM</button>
        </section>

        <section className="faq-section-pro">
          <SectionHeader title="Có thể bạn chưa biết" />
          <div className="faq-container-pro">
            {FAQ.map((f, i) => (
              <FaqItem key={i} question={f.q} answer={f.a} isOpen={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </section>
        <section className="mx-auto mb-20 grid w-full max-w-[1520px] grid-cols-1 gap-6 px-5 md:grid-cols-2 lg:px-8">
          {PROFESSIONAL_BOTTOM_BANNERS.map((b) => (
            <BannerCard key={b.id} b={b} className="h-[56vh] min-h-[360px]" />
          ))}
        </section>
      </main>
    </div>
  );
}
