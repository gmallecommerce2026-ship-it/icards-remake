"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { settingsApi, templatesApi } from "@/lib/api";
import { flattenTemplates, type TreeNode } from "@/lib/templates-tree";

/* Giá trị lấy trực tiếp từ HomepageContent.css của bản src (đã áp dụng đúng thứ tự cascade). */

import { listOf, templatesOf } from "@/lib/api/list";
import { InvitationPreview } from "@/components/templates/InvitationPreview";
import { TemplateShowcase } from "@/components/templates/TemplateShowcase";
import type { InvitationTemplate } from "@/lib/templates";
import type { TemplateTitleStyle } from "@/lib/title-style";
import { HOME_BANNERS, HOME_BOTTOM_BANNERS } from "@/lib/banners";
import type { Slide } from "@/components/ui/Carousel";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { AdBanner } from "@/components/ads/AdBanner";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

type Block = { _id: string; title: string; slug: string; isActive?: boolean; templates?: { _id: string; imgSrc?: string }[] };
type Template = InvitationTemplate & { _id: string; title: string; imgSrc?: string; titleStyle?: TemplateTitleStyle };
type Banner = { id?: string; name?: string; displayPage?: string; isEnabled?: boolean; imgSrc?: string; link?: string };

const HERO_FALLBACK = "https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png";
const placeholder = (text: string, size: string) => `https://placehold.co/${size}/e6e6e6/999?text=${encodeURIComponent(text)}`;

const DEFAULT_INTRO = `
  <h3>Về iCards - Nền Tảng Thiết Kế Thiệp Online Hàng Đầu</h3>
  <p>Chào mừng bạn đến với <strong>iCards</strong>, giải pháp toàn diện giúp bạn tạo ra những tấm thiệp mời, thiệp chúc mừng ấn tượng và mang đậm dấu ấn cá nhân.</p>
  <p>Với công cụ thiết kế trực quan, bạn không cần phải là một chuyên gia đồ họa. Chỉ cần vài thao tác kéo thả, chỉnh sửa nội dung, bạn đã có ngay một tấm thiệp ưng ý để gửi đến người thân, bạn bè và đối tác.</p>
  <h4>Tại sao chọn iCards?</h4>
  <ul>
    <li><strong>Kho giao diện phong phú:</strong> Cập nhật liên tục các xu hướng thiết kế mới nhất.</li>
    <li><strong>Tùy biến linh hoạt:</strong> Thay đổi màu sắc, font chữ, hình ảnh dễ dàng.</li>
    <li><strong>Tiết kiệm chi phí & thời gian:</strong> Tạo thiệp online nhanh chóng, gửi đi tức thì qua Email, Zalo, Facebook.</li>
    <li><strong>Chất lượng cao:</strong> Hỗ trợ xuất file in ấn sắc nét hoặc file kỹ thuật số tối ưu.</li>
  </ul>
  <p>Hãy bắt đầu hành trình sáng tạo của bạn ngay hôm nay cùng iCards và biến những khoảnh khắc đặc biệt trở nên đáng nhớ hơn bao giờ hết!</p>
`;

/* ---- Class theo CSS gốc (.homepage-main, .section-header, ...) ---- */
/* Quy tắc: lưới 4px; khoảng cách giữa các khối 96 / 80 / 56px theo breakpoint. */
const MAIN =
  "mx-auto flex max-w-[1520px] flex-col items-center gap-24 px-5 py-20 max-[1200px]:gap-20 max-[1200px]:py-[60px] max-[769px]:gap-14 max-[769px]:py-10";
const SECTION = "flex w-full flex-col items-center";
/* Tiêu đề mục: eyebrow 12px · tiêu đề 36 → 30 → 26px, semibold · khoảng cách tiêu đề → nội dung 32px (24px trên mobile). */
const HEADER = "mb-8 flex flex-col items-center gap-3 text-center max-[769px]:mb-6";
const SUBTITLE = "m-0 text-xs font-semibold uppercase leading-none tracking-[0.18em] text-[#6b6b6b]";
const TITLE =
  "m-0 max-w-[720px] font-playfair text-[36px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#1a1a1a] max-[993px]:text-[30px] max-[769px]:text-[26px]";

function SectionHeader({ sub, title }: { sub: string; title: string }) {
  return (
    <div className={HEADER}>
      <p className={SUBTITLE}>{sub}</p>
      <h2 className={TITLE}>{title}</h2>
    </div>
  );
}

type OccasionItem = { key: string; title: string; href: string; img?: string };

/* Nút trước/sau: ẩn khi chưa rê chuột vào carousel, rê vào thì hiện cả hai nút hai bên.
   Trên màn hình cảm ứng (không có hover) hoặc khi dùng bàn phím (focus) thì luôn hiện.
   Đang ở mép cuối thì nút đó chỉ mờ đi, vẫn giữ vị trí để bố cục không nhảy. */
function ArrowButton({ direction, onClick, disabled }: { direction: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Xem các dịp trước" : "Xem các dịp tiếp theo"}
      className={`absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-[#27548A]/20 bg-white/95 text-[#27548A] shadow-[0_10px_24px_-10px_rgba(14,27,44,0.45)] backdrop-blur transition-all duration-200 hover:border-[#27548A] hover:bg-[#27548A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A] active:scale-95 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 max-[769px]:opacity-100 disabled:pointer-events-none disabled:opacity-40 group-hover:disabled:opacity-40 max-[769px]:disabled:opacity-40 max-[769px]:size-10 ${
        direction === "prev" ? "left-2" : "right-2"
      }`}
    >
      <Icon className="size-6 max-[769px]:size-5" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

function Occasions({ items }: { items: OccasionItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [items]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="group relative mb-8 w-full">
      <ArrowButton direction="prev" onClick={() => scroll(-1)} disabled={edge.start} />
      <div
        ref={ref}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 py-3 [-ms-overflow-style:none] [scrollbar-width:none] max-[769px]:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((o) => (
          <Link
            key={o.key}
            href={o.href}
            className="group block w-[clamp(160px,20vw,220px)] shrink-0 cursor-pointer snap-start transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#f3f1ee] shadow-[0_6px_18px_-8px_rgba(14,27,44,0.28)] ring-1 ring-[#0E1B2C]/10 transition-shadow duration-300 group-hover:shadow-[0_12px_28px_-10px_rgba(14,27,44,0.35)]">
              <img
                src={o.img || placeholder(o.title, "330x440")}
                alt={o.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* Tên danh mục nằm phía trên, trong thẻ, trên nền gradient tối để chữ luôn đọc được */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/65 via-black/30 to-transparent px-4 pb-10 pt-4">
                <p
                  style={{ fontFamily: "var(--font-tpl-display), Georgia, serif" }}
                  className="m-0 line-clamp-2 text-center text-[22px] font-semibold leading-[1.2] tracking-[0.01em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]"
                >
                  {o.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* Tên mẫu dưới thẻ: cùng font serif với tên danh mục ở khối "Những dịp" */
const FEATURED_NAME_STYLE: CSSProperties = {
  fontFamily: "var(--font-tpl-display), Georgia, serif",
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.25,
  color: "#0E1B2C",
};

function FeaturedCard({ t }: { t: Template }) {
  return (
    <Link
      href={`/templates/${t.slug}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A]"
    >
      <TemplateShowcase template={t} />
      <h3 style={FEATURED_NAME_STYLE} className="mt-3 truncate text-center group-hover:underline group-hover:underline-offset-4">
        {t.title}
      </h3>
    </Link>
  );
}

/* 3 banner cuối trang, đặt ngay phía trên khối "Về chúng tôi".
   2 banner đầu xếp cạnh nhau, banner thứ 3 rộng toàn chiều ngang. Chiều cao rút gọn để cả 3 vừa một màn hình. */
function BannerLink({ b, className }: { b: (typeof HOME_BOTTOM_BANNERS)[number]; className: string }) {
  return (
    <Link href={b.href} className={`group relative flex overflow-hidden rounded-sm bg-[#0E1B2C] ${className}`}>
      {b.image ? (
        <img src={b.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-[#0E1B2C]" />
      )}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative flex w-full flex-col justify-end p-8 text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] md:p-12">
        {b.eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">{b.eyebrow}</p>}
        <h3 className="mt-3 text-3xl font-bold leading-[1.2] tracking-tight md:text-4xl">{b.title}</h3>
        {b.text && <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">{b.text}</p>}
        {b.cta && (
          <span className="mt-7 inline-flex h-12 w-fit items-center rounded-sm bg-white px-7 text-sm font-semibold text-[#0E1B2C] transition group-hover:bg-white/90">
            {b.cta}
          </span>
        )}
      </div>
    </Link>
  );
}

function BottomBanners() {
  const [first, second, wide] = HOME_BOTTOM_BANNERS;
  return (
    <section className="flex w-full flex-col gap-6">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        {[first, second].map((b) => (
          <BannerLink key={b.id} b={b} className="h-[48vh] min-h-[320px]" />
        ))}
      </div>
      {wide && <BannerLink b={wide} className="h-[44vh] min-h-[300px] w-full" />}
    </section>
  );
}

function Intro({ html }: { html?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);

  useEffect(() => {
    if (ref.current) setLong(ref.current.scrollHeight > 200);
  }, [html]);

  return (
    <section className="flex w-full max-w-[1000px] flex-col items-center gap-6">
      <SectionHeader sub="VỀ CHÚNG TÔI" title="GIỚI THIỆU ICARDS" />

      <div
        className={`relative w-full overflow-hidden transition-[max-height] duration-500 ease-in-out ${open ? "max-h-[2000px]" : "max-h-[200px]"}`}
      >
        <div
          ref={ref}
          className="text-base leading-[1.8] text-[#444] text-justify max-[769px]:px-2.5 max-[769px]:text-left
            [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:font-playfair [&_h3]:text-[1.17em] [&_h3]:font-bold [&_h3]:text-[#222]
            [&_h4]:mb-3 [&_h4]:mt-5 [&_h4]:font-playfair [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-[#222]
            [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:ml-5 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: html || DEFAULT_INTRO }}
        />
        {!open && long && (
          <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-[linear-gradient(to_bottom,rgba(254,253,253,0),rgba(254,253,253,1))]" />
        )}
      </div>

      {long && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-2.5 flex cursor-pointer items-center gap-2 rounded-[30px] border border-[#ddd] bg-transparent px-6 py-2.5 font-inter text-sm font-semibold text-[#555] transition-all duration-300 hover:border-[#333] hover:bg-[#f9f9f9] hover:text-[#222]"
        >
          {open ? "Thu gọn" : "Xem thêm"}
          <svg
            width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </section>
  );
}

export function HomepageContent() {
  const [loading, setLoading] = useState(true);
  const [occasions, setOccasions] = useState<OccasionItem[]>([]);
  const [featured, setFeatured] = useState<Template[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [introHtml, setIntroHtml] = useState<string | undefined>();

  useEffect(() => {
    let alive = true;
    // allSettled: một API lỗi không làm trắng cả trang
    Promise.allSettled([
      templatesApi.getTemplateBlocks(),
      templatesApi.getTemplates({ limit: 50 }),
      settingsApi.getPublicSettings(),
      templatesApi.getTemplateCategoryTree(),
    ])
      .then(([blocksRes, templatesRes, settingsRes, treeRes]) => {
        if (!alive) return;
        const blocks: Block[] = blocksRes.status === "fulfilled" ? listOf<Block>(blocksRes.value.data) : [];
        const usedIds = new Set(blocks.flatMap((b) => b.templates?.map((t) => t._id) ?? []));
        // Dịp lan tỏa niềm vui = toàn bộ danh mục gốc giống menu header; chưa có cây thì dùng các khối cũ
        const d = treeRes.status === "fulfilled" ? (treeRes.value.data?.data ?? treeRes.value.data) : [];
        const roots: TreeNode[] = Array.isArray(d) ? d : [];
        setOccasions(
          roots.length
            ? roots.map((r) => ({ key: r.id, title: r.label, href: r.path, img: flattenTemplates(r).find((t) => t.previewImage)?.previewImage ?? undefined }))
            : blocks.filter((b) => b.isActive).map((b) => ({ key: b._id, title: b.title, href: "/templates", img: b.templates?.[0]?.imgSrc })),
        );

        // list.ts giữ nguyên mọi trường backend trả về (palette, sample, motif...) nên đủ dữ liệu cho InvitationPreview.
        const all = (templatesRes.status === "fulfilled" ? templatesOf(templatesRes.value.data) : []) as unknown as Template[];
        setFeatured(all.filter((t) => !usedIds.has(t._id)).slice(0, 8));

        if (settingsRes.status === "fulfilled") {
          const s = settingsRes.value.data?.data ?? settingsRes.value.data ?? {};
          setBanners((s.banners ?? []).filter((b: Banner) => b.displayPage === "home" && b.isEnabled));
          setIntroHtml(s.introText || undefined);
        }
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-[#FEFDFD] px-10 py-20">
        <div className="h-[calc(100svh-112px)] min-h-[480px] w-full bg-[#eee]" />
        <div className="mx-auto mt-16 grid max-w-[1520px] grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-square bg-[#eee]" />
          ))}
        </div>
      </div>
    );
  }

  const hero = banners.find((b) => b.name?.toLowerCase().includes("chính")) ?? banners[0];
  const secondary = banners.filter((b) => b !== hero).slice(0, 2);

  // Banner trang chủ: lấy từ cài đặt (bật, hiển thị ở trang chủ); chưa có thì dùng banner mặc định
  const homeSlides: Slide[] = banners.length
    ? banners.map((b, k) => ({
        id: b.id ?? `home-${k}`,
        eyebrow: "iCards",
        title: b.name || "Thiệp mời online đẹp",
        text: "Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.",
        href: b.link || "/templates",
        cta: "Xem mẫu thiệp",
        tone: "from-[#0E1B2C] to-[#27548A]",
        image: b.imgSrc || undefined,
      }))
    : HOME_BANNERS.map((sl, k) => ({ ...sl, image: k === 0 ? HERO_FALLBACK : undefined }));
  const heroEl = <HeroCarousel slides={homeSlides} fullHeight />;

  return (
    <div className="bg-[#FEFDFD] font-inter text-[#333]">
      <SideAdsShell hero={heroEl}>
      <main className={MAIN}>
        <section className={SECTION}>
          <SectionHeader sub="NHỮNG CƠ HỘI MỌI NGƯỜI KẾT NỐI THÂN THIẾT" title="NHỮNG DỊP LAN TỎA NIỀM VUI" />
          {occasions.length > 0 ? <Occasions items={occasions} /> : <p className="text-center text-[#666]">Đang cập nhật các khối...</p>}
        </section>

        <section className={SECTION}>
          <SectionHeader sub="KHÁM PHÁ NHỮNG MẪU THIỆP ĐỘC ĐÁO" title="MẪU THIỆP NỔI BẬT" />
          {featured.length > 0 ? (
            <div className="grid w-full grid-cols-4 gap-x-6 gap-y-10 max-[1200px]:grid-cols-3 max-[993px]:grid-cols-2 max-[769px]:gap-x-4 max-[769px]:gap-y-8 max-[577px]:grid-cols-1">
              {featured.map((t) => <FeaturedCard key={t._id} t={t} />)}
            </div>
          ) : (
            <p className="col-span-full text-center text-[#666]">Chưa có mẫu thiệp nổi bật nào.</p>
          )}
          <Link
            href="/templates"
            className="mt-2 flex h-12 w-fit cursor-pointer items-center justify-center border border-[#222] bg-transparent px-10 text-sm font-semibold uppercase leading-[1.3] tracking-[0.08em] text-[#222] transition-colors duration-300 hover:bg-[#222] hover:text-white"
          >
            XEM TẤT CẢ
          </Link>
        </section>

        <AdBanner
          className="w-full"
          title="Bộ sưu tập thiệp cưới mới"
          text="Khám phá các mẫu thiệp được cập nhật thường xuyên cho đám cưới, sinh nhật và đầy tháng."
          cta="Xem mẫu thiệp"
          href="/templates"
        />

        {secondary.length > 0 && (
          <section className="flex w-full flex-col gap-10">
            {secondary.map((b, i) => (
              <a key={b.id ?? i} href={b.link ?? "#"} className="block w-full">
                <img src={b.imgSrc} alt={b.name ?? ""} className="h-auto w-full object-cover" />
              </a>
            ))}
          </section>
        )}

        <BottomBanners />

        <Intro html={introHtml} />
      </main>
      </SideAdsShell>
    </div>
  );
}

export default HomepageContent;
