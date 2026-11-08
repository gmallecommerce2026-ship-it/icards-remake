"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { settingsApi, templatesApi } from "@/lib/api";

/* Giá trị lấy trực tiếp từ HomepageContent.css của bản src (đã áp dụng đúng thứ tự cascade). */

import { listOf, templatesOf } from "@/lib/api/list";
import { titleStyleToCss, type TemplateTitleStyle } from "@/lib/title-style";

type Block = { _id: string; title: string; slug: string; isActive?: boolean; templates?: { _id: string; imgSrc?: string }[] };
type Template = { _id: string; title: string; slug: string; imgSrc?: string; titleStyle?: TemplateTitleStyle };
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
const MAIN =
  "mx-auto flex max-w-[1520px] flex-col items-center gap-[140px] px-10 py-20 max-[1200px]:gap-[120px] max-[1200px]:px-[30px] max-[1200px]:py-[60px] max-[769px]:gap-20 max-[769px]:px-5 max-[769px]:py-10";
const SECTION = "flex w-full flex-col items-center";
const HEADER = "mb-10 flex flex-col items-center gap-2 text-center";
const SUBTITLE = "text-sm font-medium uppercase leading-[1.5] tracking-[0.1em] text-[#555]";
const TITLE =
  "max-w-[700px] font-playfair text-[42px] font-bold leading-[1.2] text-[#1a1a1a] max-[993px]:text-[36px] max-[769px]:text-[28px]";

function SectionHeader({ sub, title }: { sub: string; title: string }) {
  return (
    <div className={HEADER}>
      <p className={SUBTITLE}>{sub}</p>
      <h2 className={TITLE}>{title}</h2>
    </div>
  );
}

/* Mũi tên: SVG và rotate giống hệt bản gốc (cả hai nút đều được xoay 180°, xem ghi chú) */
function ArrowButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-[44px] w-[44px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#eee] bg-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur-[5px] transition-all duration-200 hover:bg-[#f8f9fa] hover:shadow-[0_6px_15px_rgba(0,0,0,0.15)] max-[993px]:hidden [&_svg]:rotate-180 ${
        direction === "prev" ? "left-[-20px]" : "right-[-20px]"
      }`}
    >
      <svg width="13" height="22" viewBox="0 0 13 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 2L3 11L11 20" stroke="black" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function Occasions({ items }: { items: Block[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.offsetWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative mb-8 flex w-full items-center">
      <ArrowButton direction="prev" onClick={() => scroll(-1)} />
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] max-[769px]:px-[15px] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((o) => (
          <Link
            key={o._id}
            href="/templates"
            className="group flex w-[clamp(160px,20vw,220px)] shrink-0 cursor-pointer snap-start flex-col items-center gap-4 transition-transform duration-300 hover:-translate-y-[5px]"
          >
            <div className="mb-3 flex h-[324px] w-full items-center justify-center overflow-hidden bg-white shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
              <img
                src={o.templates?.[0]?.imgSrc || placeholder(o.title, "324x324")}
                alt={o.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-[ease] group-hover:scale-110"
              />
            </div>
            <p className="m-0 text-center text-base font-semibold uppercase leading-[1.4] tracking-[0.05em] text-[#333]">{o.title}</p>
          </Link>
        ))}
      </div>
      <ArrowButton direction="next" onClick={() => scroll(1)} />
    </div>
  );
}

/* Tên mẫu nằm phía trên, bên trong thẻ (nền gradient tối để chữ luôn đọc được). Font/cỡ/màu theo t.titleStyle, do dashboard cài cho từng mẫu hoặc từng danh mục. */
function FeaturedCard({ t }: { t: Template }) {
  return (
    <Link
      href={`/templates/${t.slug}`}
      className="group relative block w-full cursor-pointer overflow-hidden bg-white pt-[100%] transition-shadow duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)]"
    >
      <img
        src={t.imgSrc || placeholder("Thiệp", "365x365")}
        alt={t.title}
        loading="lazy"
        className="absolute left-0 top-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 via-black/25 to-transparent px-4 pb-10 pt-4">
        <h5
          style={titleStyleToCss(t.titleStyle)}
          className="m-0 leading-[1.25] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]"
        >
          {t.title}
        </h5>
      </div>
    </Link>
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
    <section className="mt-10 flex w-full max-w-[1000px] flex-col items-center gap-6">
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
  const [occasions, setOccasions] = useState<Block[]>([]);
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
    ])
      .then(([blocksRes, templatesRes, settingsRes]) => {
        if (!alive) return;
        const blocks: Block[] = blocksRes.status === "fulfilled" ? listOf<Block>(blocksRes.value.data) : [];
        const usedIds = new Set(blocks.flatMap((b) => b.templates?.map((t) => t._id) ?? []));
        setOccasions(blocks.filter((b) => b.isActive));

        const all: Template[] = templatesRes.status === "fulfilled" ? templatesOf(templatesRes.value.data) : [];
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
        <div className="aspect-[16/9] max-h-[600px] w-full bg-[#eee]" />
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

  return (
    <div className="bg-[#FEFDFD] font-inter text-[#333]">
      <section className="w-full overflow-hidden">
        {hero?.link ? (
          <a href={hero.link}>
            <img src={hero.imgSrc || HERO_FALLBACK} alt={hero.name ?? "iCards"} className="block aspect-[16/9] max-h-[600px] w-full object-cover" />
          </a>
        ) : (
          <img src={hero?.imgSrc || HERO_FALLBACK} alt={hero?.name ?? "iCards"} className="block aspect-[16/9] max-h-[600px] w-full object-cover" />
        )}
      </section>

      <main className={MAIN}>
        <section className={SECTION}>
          <SectionHeader sub="NHỮNG CƠ HỘI MỌI NGƯỜI KẾT NỐI THÂN THIẾT" title="NHỮNG DỊP LAN TỎA NIỀM VUI" />
          {occasions.length > 0 ? <Occasions items={occasions} /> : <p className="text-center text-[#666]">Đang cập nhật các khối...</p>}
        </section>

        <section className={SECTION}>
          <SectionHeader sub="KHÁM PHÁ NHỮNG MẪU THIỆP ĐỘC ĐÁO" title="MẪU THIỆP NỔI BẬT" />
          {featured.length > 0 ? (
            <div className="grid w-full grid-cols-4 gap-6 max-[1200px]:grid-cols-3 max-[993px]:grid-cols-2 max-[769px]:gap-4 max-[577px]:grid-cols-1">
              {featured.map((t) => <FeaturedCard key={t._id} t={t} />)}
            </div>
          ) : (
            <p className="col-span-full text-center text-[#666]">Chưa có mẫu thiệp nổi bật nào.</p>
          )}
          <Link
            href="/templates"
            className="mt-0 flex h-12 w-fit cursor-pointer items-center justify-center border border-[#222] bg-transparent px-10 text-sm font-semibold uppercase leading-[1.3] tracking-[0.08em] text-[#222] transition-colors duration-300 hover:bg-[#222] hover:text-white"
          >
            XEM TẤT CẢ
          </Link>
        </section>

        {secondary.length > 0 && (
          <section className="flex w-full flex-col gap-10">
            {secondary.map((b, i) => (
              <a key={b.id ?? i} href={b.link ?? "#"} className="block w-full">
                <img src={b.imgSrc} alt={b.name ?? ""} className="h-auto w-full object-cover" />
              </a>
            ))}
          </section>
        )}

        <Intro html={introHtml} />
      </main>
    </div>
  );
}

export default HomepageContent;
