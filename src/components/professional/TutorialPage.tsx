"use client";

/* Mã nguồn giữ theo TutorialPage.js của bản src; CSS ở TutorialPage.css (cùng tên class). */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { settingsApi, templatesApi } from "@/lib/api";
import "./TutorialPage.css";

type Template = { _id: string; title: string; slug?: string; category: string; description?: string; imgSrc?: string };
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

const TemplateCard = ({ slug, title, imgSrc }: { slug: string; title: string; imgSrc?: string }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  return (
    <div className="template-card-pro" onClick={() => router.push(`/templates/${slug}`)}>
      <div className="card-image-wrapper-pro">
        <img src={imgSrc || "https://placehold.co/365x365/F5F5F5/333?text=Thiệp+Mẫu"} alt={title} />
      </div>
      <div className="card-info-pro">
        <h5>{title}</h5>
        <div
          className={`heart-icon-pro ${isLiked ? "liked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.3158 0.482422C13.8842 0.482422 12.0211 2.21053 11.0526 3.47368H10.9474C9.97895 2.21053 8.11579 0.482422 5.68421 0.482422C2.52632 0.482422 0 3.01895 0 6.16632C0 11.7558 11 17 11 17C11 17 22 11.7558 22 6.16632C22 3.01895 19.4737 0.482422 16.3158 0.482422Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const CategoryShowcaseCard = ({ template }: { template: Template }) => {
  const router = useRouter();
  return (
    <div className="category-showcase-card">
      <div className="category-showcase-text">
        <h3>{template.category}</h3>
        <p>{template.description || "Những mẫu thiệp đẹp, chuyên nghiệp và cá nhân hóa."}</p>
        <button onClick={() => router.push("/templates")}>{`Tạo ${template.category} online`}</button>
      </div>
      <div className="category-showcase-image">
        <img src={template.imgSrc || "https://placehold.co/160x160/e6e6e6/333?text=Image"} alt={template.category} />
      </div>
    </div>
  );
};

const CarouselArrow = ({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled: boolean }) => (
  <button className={`carousel-arrow ${direction}`} onClick={onClick} disabled={disabled}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={direction === "left" ? "M15 18L9 12L15 6" : "M9 18L15 12L9 6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

/* Banner: giữ logic của bản src; khi chưa có banner từ settings sẽ dùng tiêu đề mặc định */
function ProBanner({ banner }: { banner?: Banner }) {
  if (!banner) {
    return (
      <div style={{ position: "relative", width: "100%", display: "flex" }}>
        <img src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png" alt="Hero Banner" style={{ width: "100%", height: "100%", minHeight: "400px", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1 }} />
        <div className="hero-content" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", textShadow: "2px 2px 10px rgba(0,0,0,0.8)", textAlign: "center", padding: "20px", zIndex: 2 }}>
          <h1 className="hero-title" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: "bold", margin: "0 0 16px 0", lineHeight: "1.2", maxWidth: "90%" }}>Chuyên nghiệp</h1>
          <p className="hero-subtitle" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", margin: 0, fontWeight: "500", maxWidth: "90%" }}>Hướng dẫn chi tiết và các mẹo hữu ích</p>
        </div>
      </div>
    );
  }
  if (banner.mediaType === "html") return <div dangerouslySetInnerHTML={{ __html: banner.htmlContent ?? "" }} style={{ width: "100%", height: "100%" }} />;

  const content = (
    <div style={{ position: "relative", width: "100%", display: "flex" }}>
      {banner.mediaType === "video" && banner.videoUrl ? (
        <video src={banner.videoUrl} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", minHeight: "400px", objectFit: "cover", display: "block" }} />
      ) : (
        <img src={banner.imageUrl || "https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/default-banner.png"} alt={banner.title || "Banner"} style={{ width: "100%", height: "100%", minHeight: "400px", objectFit: "cover", display: "block" }} />
      )}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)", zIndex: 1 }} />
      <div className="hero-content" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", textShadow: "2px 2px 10px rgba(0,0,0,0.8)", textAlign: "center", padding: "20px", zIndex: 2 }}>
        {banner.title && <h1 className="hero-title" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: "bold", margin: "0 0 16px 0", lineHeight: "1.2", maxWidth: "90%" }}>{banner.title}</h1>}
        {banner.subtitle && <p className="hero-subtitle" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", margin: 0, fontWeight: "500", maxWidth: "90%" }}>{banner.subtitle}</p>}
      </div>
    </div>
  );
  if (!banner.link) return content;
  return banner.link.startsWith("http") ? (
    <a href={banner.link} target="_blank" rel="noopener noreferrer" className="hero-link-wrapper" style={{ display: "block", width: "100%" }}>{content}</a>
  ) : (
    <Link href={banner.link} className="hero-link-wrapper" style={{ display: "block", width: "100%" }}>{content}</Link>
  );
}

export default function TutorialPage() {
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showcaseTemplates, setShowcaseTemplates] = useState<Template[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
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
        const [showcaseRes, allRes] = await Promise.all([templatesApi.getTemplates({ limit: 10 }), templatesApi.getTemplates({ limit: 1000 })]);
        const showcaseAll: Template[] = showcaseRes.data?.data ?? [];
        const uniq = [...new Set(showcaseAll.map((t) => t.category))];
        setShowcaseTemplates(uniq.map((c) => showcaseAll.find((t) => t.category === c)).filter(Boolean) as Template[]);

        const allData: Template[] = allRes.data?.data ?? [];
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
      .then((res) => setTemplates(res.data?.data ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(showcaseTemplates.length / ITEMS_PER_PAGE);
  const handleCarouselScroll = (dir: "left" | "right") =>
    setCarouselIndex((prev) => (dir === "left" ? Math.max(0, prev - 1) : Math.min(totalPages - 1, prev + 1)));

  const professionalBanner = banners.find((b) => b.displayPage === "professional" && b.isEnabled) || banners.find((b) => b.displayPage === "all" && b.isEnabled);

  return (
    <div className="pro-page-wrapper">
      <section className="page-hero-wrapper" style={{ width: "100%", overflow: "hidden" }}>
        <ProBanner banner={professionalBanner} />
      </section>

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

        <section className="category-showcase-section">
          <SectionHeader title="Dễ dàng tạo thiệp mời từ vô vàn mẫu thiệp có sẵn" subtitle="Những mẫu thiệp đẹp, chuyên nghiệp và cá nhân hoá, cho ngày trọng đại thêm nhiều ý nghĩa." />
          <div className="category-showcase-carousel-wrapper">
            <CarouselArrow direction="left" onClick={() => handleCarouselScroll("left")} disabled={carouselIndex === 0} />
            <div className="carousel-viewport">
              <div className="category-showcase-grid-transform" style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
                {showcaseTemplates.map((t) => <CategoryShowcaseCard key={t._id} template={t} />)}
              </div>
            </div>
            <CarouselArrow direction="right" onClick={() => handleCarouselScroll("right")} disabled={carouselIndex >= totalPages - 1} />
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
          <div className="template-showcase-grid-pro">
            {loading && !templates.length ? (
              <p>Đang tải...</p>
            ) : (
              templates.map((t) => <TemplateCard key={t._id} slug={t.slug ?? t._id} title={t.title} imgSrc={t.imgSrc} />)
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
      </main>
    </div>
  );
}
