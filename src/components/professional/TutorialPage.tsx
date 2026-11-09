"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Calendar, ChevronDown, FileText, Heart, Link2, Mail, Share2, Users } from "lucide-react";
import { settingsApi, templatesApi } from "@/lib/api";
import { templatesOf } from "@/lib/api/list";
import type { InvitationTemplate } from "@/lib/templates";
import { TemplateShowcase } from "@/components/templates/TemplateShowcase";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { BannerCard } from "@/components/ui/BannerCard";
import { Container } from "@/components/ui/Primitives";
import type { Slide } from "@/components/ui/Carousel";
import { PROFESSIONAL_BANNERS, PROFESSIONAL_BOTTOM_BANNERS } from "@/lib/banners";

type Template = InvitationTemplate & { _id: string; title: string; imgSrc?: string };
type Banner = { displayPage?: string; isEnabled?: boolean; imageUrl?: string; title?: string; subtitle?: string; link?: string; mediaType?: string; videoUrl?: string; htmlContent?: string };

const FAQ = [
  { q: "Thiệp mời online là gì?", a: "Thiệp mời online là thiệp mời trên nền tảng số trực tuyến, thay vì được in ra giấy như các tấm thiệp mời truyền thống. Sau khi tạo thiệp mời online, bạn sẽ gửi tấm thiệp tới khách mời thông qua tin nhắn hoặc mạng xã hội như Facebook, Zalo,... Khi đó, khách mời chỉ cần có kết nối Internet là đã có thể xem được tấm thiệp mời của bạn." },
  { q: "Thiệp mời online và thiệp mời truyền thống khác nhau thế nào?", a: "Thiệp mời online và thiệp mời truyền thống có nhiều điểm khác biệt, chủ yếu ở hình thức, thiết kế, cách truyền tải thông tin đám cưới và cách gửi thiệp:\n\n1. Với thiệp mời truyền thống: Là thiệp in giấy, với những thiết kế phổ thông, khó thay đổi theo mong muốn cá nhân, chi phí in ấn cao, hình thức gửi thiệp là Tay Trao Tay cho khách mời. Với thời đại công nghệ hiện nay, đa phần mọi người bắt đầu sử dụng thiệp bán online, ví dụ như: Chụp hình thiệp truyền thống để gửi tin nhắn hoặc mạng xã hội cho khách mời, hoặc tự thiết kế rồi xuất thành hình ảnh rồi gửi online cho khách mời.\n\n2. Với thiệp mời online: Là thiệp bạn có thể tự mình thiết kế trên nền tảng thiết kế thiệp mời online, với đa dạng mẫu thiết kế, và cá nhân hoá thiệp mời theo những gì bạn thích. Không cần phải in ấn nên tiết kiệm chi phí. Có tính năng quản lý danh sách khách mời, và gửi thiệp mời cho từng khách bằng một liên kết online thông qua internet như tin nhắn, Facebook, Zalo,..." },
  { q: "Lợi ích của thiệp mời online là gì?", a: "Không đơn thuần là một tấm thiệp, thiệp mời online là một sự kết hợp hoàn hảo với nền tảng số.\n\nCá nhân hóa thiết kế, để sự kiện trở nên ấn tượng hơn. Tiết kiệm chi phí in ấn thiệp mời, góp phần bảo vệ môi trường. Quản lý thông tin khách mời dễ dàng và cho phép khách mời có thể xác nhận tham dự, giúp bạn kế hoạch cho sự kiện chu toàn hơn. Dễ dàng gửi thiệp mời qua Facebook, Zalo, SMS hoặc bằng mail thông qua internet cho tất cả khách mời." },
  { q: "Tôi có thể đặt in thiệp mời được không?", a: "Được, bạn có thể thiết kế thiệp mời, và trực tiếp đặt in trên nền tảng iCards. Chúng tôi cung cấp dịch vụ In ấn chất lượng - Chuyển thiệp tận nơi. Chúng tôi giúp bạn biến những thiết kế của bạn thành những tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền!\n\nNgoài ra, bạn cũng có thể tải xuống bản thiết kế, sau đó có thể đặt in ở bất kỳ nhà in ấn thiệp mời nào mà bạn muốn." },
  { q: "Thời gian in và nhận thiệp bao lâu?", a: "Thời gian in và nhận thiệp sẽ tuỳ thuộc vào loại thiệp bạn chọn (giấy in, chi tiết trên thiệp, cách điệu thiệp, v.v) và địa điểm giao nhận thiệp. Thông thường bạn sẽ nhận được thiệp sau 7 -10 ngày đặt in. Trong trường hợp, bạn cần in thiệp gấp, vui lòng liên hệ admin để được hỗ trợ." },
];;

const FEATURES_LEFT = [
  { icon: Link2, title: "Trang thông tin cưới", description: "Trang web thể hiện đầy đủ thông tin cần thiết cho đám cưới, bao gồm sự kiện cưới, thông tin dâu rể, chuyện tình yêu và album ảnh cưới. Lưu giữ kỷ niệm và chia sẻ với bạn bè, người thân." },
  { icon: Users, title: "Danh sách khách mời", description: "Lên danh sách và quản lý thông tin khách mời giúp bạn dễ dàng xác định được số lượng người tham dự, tính toán chi phí phù hợp cho đám cưới của mình." },
  { icon: Calendar, title: "Kế hoạch cưới", description: "Tạo và theo dõi công việc cho ngày trọng đại của bạn, đảm bảo mọi thứ theo kế hoạch, cho đám cưới của bạn được vẹn toàn." },
];
const FEATURES_RIGHT = [
  { icon: FileText, title: "Ngân sách cưới", description: "Lập kế hoạch tài chính chi tiết và quản lý chi tiêu một cách thông minh. Tối ưu hóa ngân sách và đảm bảo rằng bạn có thể tận hưởng ngày cưới mà không cần lo lắng về tài chính." },
  { icon: Share2, title: "Thiệp cưới online", description: "Tự tay thiết kế và gửi thiệp cưới online độc đáo. Với những mẫu thiệp chuyên nghiệp, bạn có thể gửi thiệp một cách dễ dàng và hiện đại, trong khi đó vẫn thể hiện sự trọn vẹn với khách mời của bạn." },
  { icon: Heart, title: "Gửi lời chúc", description: "Cho phép bạn bè gửi lời chúc mừng, và lưu giữ mãi mãi. Thật tuyệt vời nếu 10 năm, 20 năm sau bạn vẫn còn nhớ những ai và nói những lời ấm áp nhất của ngày trọng đại." },
];

const PROCESS = ["Chọn mẫu thiệp", "Chỉnh sửa", "Đặt in", "Nhận thiệp"];
const BENEFITS: [string, string][] = [
  ["Mẫu thiệp", "Đa dạng phong cách"],
  ["Quản lý khách", "Xác nhận tham dự"],
  ["In ấn tận nơi", "Đúng cam kết chất lượng"],
  ["Tải bản thiết kế", "In ở bất kỳ đâu"],
];

const TEMPLATE_GRID = "grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4";

/* Khối dùng chung: mọi mục đều có cùng padding ngang (Container) và cùng khoảng cách dọc. */
function Section({ children, id, className = "", label }: { children: ReactNode; id?: string; className?: string; label?: string }) {
  return (
    <section id={id} aria-label={label} className={`py-20 lg:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

/* Tiêu đề mục: nhãn nhỏ, tiêu đề lớn, mô tả */
function SectionHeader({ eyebrow, title, subtitle, align = "center" }: { eyebrow?: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  const alignCls = align === "center" ? "mx-auto items-center text-center" : "items-start text-left";
  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignCls}`}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lacquer">{eyebrow}</p>}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Heart; title: string; description: string }) {
  return (
    <div className="group flex gap-4 border border-line bg-white p-6 transition-colors hover:border-lacquer/40">
      <span className="grid size-11 shrink-0 place-items-center bg-lacquer-soft text-lacquer transition-colors group-hover:bg-lacquer group-hover:text-white">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}

function ProTemplateCard({ template }: { template: Template }) {
  return (
    <Link href={`/templates/${template.slug}`} className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lacquer">
      <div className="transition-transform duration-500 group-hover:-translate-y-1">
        <TemplateShowcase template={template} />
      </div>
      <h3 className="mt-4 truncate text-center text-base font-bold text-ink transition-colors group-hover:text-lacquer">{template.title}</h3>
    </Link>
  );
}

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
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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
    // tone-blue: ép màu thương hiệu #27548A cho toàn trang, không theo theme 1–5
    <div className="tone-blue bg-[#FEFDFD] text-ink">
      <HeroCarousel slides={heroSlides} />

      {/* Dải lợi ích nhanh */}
      <section aria-label="Lợi ích" className="border-b border-line bg-white">
        <Container className="grid grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(([a, b]) => (
            <div key={a} className="border-b border-line px-5 py-6 lg:border-b-0 lg:border-l lg:px-8 lg:first:border-l-0 lg:first:pl-0">
              <p className="text-sm font-bold text-ink">{a}</p>
              <p className="mt-1 text-sm text-muted">{b}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Tính năng: ba cột, ảnh ở giữa */}
      <Section label="Tính năng">
        <SectionHeader eyebrow="Tính năng" title="Các tính năng thiệp mời Pro" subtitle="Mọi thứ cần cho ngày trọng đại, gom trong một nơi." />
        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_minmax(0,1.1fr)_1fr] lg:items-center lg:gap-10">
          <div className="space-y-6">
            {FEATURES_LEFT.map((f) => <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />)}
          </div>
          <div className="relative order-first lg:order-none">
            <div aria-hidden className="absolute -inset-4 -z-10 bg-lacquer-soft" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f1.png" alt="Tính năng thiệp mời" className="mx-auto w-full max-w-md object-contain drop-shadow-xl" />
          </div>
          <div className="space-y-6">
            {FEATURES_RIGHT.map((f) => <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />)}
          </div>
        </div>
      </Section>

      {/* Mẫu thiệp nổi bật theo danh mục */}
      <Section className="border-y border-line bg-white" label="Mẫu thiệp nổi bật">
        <SectionHeader eyebrow="Mẫu thiệp" title="Dễ dàng tạo thiệp từ vô vàn mẫu có sẵn" subtitle="Những mẫu thiệp đẹp, chuyên nghiệp và cá nhân hoá, cho ngày trọng đại thêm nhiều ý nghĩa." />
        <div className={`mt-16 ${TEMPLATE_GRID}`}>
          {showcaseTemplates.map((t) => <ProTemplateCard key={t._id} template={t} />)}
        </div>
      </Section>

      {/* In ấn: khối màu thương hiệu, nằm trong cùng container */}
      <Section label="In ấn">
        <div className="grid overflow-hidden bg-lacquer text-white lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-8 p-8 sm:p-12 lg:p-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">In ấn & giao tận nơi</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">In ấn chất lượng, chuyển thiệp tận nơi</h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Chúng tôi giúp bạn biến những thiết kế thành tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền.
              </p>
            </div>

            <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
              {PROCESS.map((title, i) => (
                <li key={title} className="border-t border-white/25 pt-4">
                  <span className="text-sm font-bold tabular-nums text-white/60">0{i + 1}</span>
                  <p className="mt-1 text-sm font-semibold">{title}</p>
                </li>
              ))}
            </ol>

            <p className="border-l-2 border-white/40 pl-4 text-sm leading-relaxed text-white/75">
              Thời gian nhận thiệp thường mất 7–10 ngày (bao gồm 2–3 ngày in), tuỳ địa điểm nhận hàng và không tính các phát sinh khác.
            </p>
          </div>

          <div className="relative min-h-[320px] bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f2.png" alt="Quy trình in ấn" className="absolute inset-0 size-full object-cover" />
          </div>
        </div>
      </Section>

      {/* Tải bản thiết kế */}
      <Section className="border-t border-line bg-white" label="Tải bản thiết kế">
        <SectionHeader eyebrow="Tự do đặt in" title="Tải xuống bản thiết kế của bạn" subtitle="Tải bản thiết kế về và đặt in ở bất kỳ nơi nào bạn muốn." />
        <div className="mx-auto mt-14 max-w-4xl border border-line bg-porcelain p-6 sm:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerSecondary} alt="Mẫu thiết kế thiệp" className="mx-auto max-h-[460px] w-auto object-contain" />
        </div>
        <p className="mx-auto mt-8 max-w-2xl border-l-2 border-lacquer bg-lacquer-soft/60 p-4 text-center text-sm leading-relaxed text-muted sm:text-left">
          Lưu ý: Chúng tôi không giải quyết các vấn đề in ấn ở địa điểm khác ngoài nhà cung cấp mà chúng tôi gợi ý.
        </p>
      </Section>

      {/* Khám phá mẫu theo danh mục */}
      <Section label="Khám phá mẫu">
        <SectionHeader eyebrow="Khám phá" title="Chọn mẫu theo phong cách của bạn" />
        <div role="tablist" aria-label="Danh mục mẫu thiệp" className="mt-12 flex flex-wrap justify-center gap-2">
          {allCategories.map((item) => {
            const on = activeCategory === item;
            return (
              <button
                key={item}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setActiveCategory(item)}
                className={`h-10 border px-5 text-sm font-medium transition-colors ${on ? "border-lacquer bg-lacquer text-white" : "border-line bg-white text-ink hover:border-lacquer hover:text-lacquer"}`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className={`mt-14 ${TEMPLATE_GRID}`}>
          {loading && !templates.length ? (
            <p className="col-span-full py-16 text-center text-muted">Đang tải mẫu thiệp…</p>
          ) : (
            templates.map((t) => <ProTemplateCard key={t._id} template={t} />)
          )}
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/templates" className="inline-flex h-12 items-center gap-2 border border-lacquer px-7 text-sm font-semibold text-lacquer transition-colors hover:bg-lacquer hover:text-white">
            Xem tất cả mẫu thiệp
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Section>

      {/* Hỏi đáp: hai cột */}
      <Section className="border-t border-line bg-white" label="Hỏi đáp">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader align="left" eyebrow="Hỏi đáp" title="Có thể bạn chưa biết" subtitle="Những câu hỏi thường gặp về thiệp mời online và dịch vụ in ấn." />
            <a href="mailto:hello@icards.vn" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-lacquer hover:underline">
              <Mail className="size-4" aria-hidden />
              Cần hỗ trợ thêm? Gửi email cho chúng tôi
            </a>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span className={`text-base font-semibold transition-colors sm:text-lg ${open ? "text-lacquer" : "text-ink"}`}>{f.q}</span>
                      <ChevronDown aria-hidden className={`size-5 shrink-0 text-muted transition-transform duration-300 ${open ? "rotate-180 text-lacquer" : ""}`} />
                    </button>
                  </h3>
                  {open && <div className="pb-7 pr-10 text-[15px] leading-8 whitespace-pre-line text-muted">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Banner cuối trang */}
      <Section label="Banner">
        <div className="grid gap-6 md:grid-cols-2">
          {PROFESSIONAL_BOTTOM_BANNERS.map((b) => (
            <BannerCard key={b.id} b={b} className="aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/10]" />
          ))}
        </div>
      </Section>
    </div>
  );
}
