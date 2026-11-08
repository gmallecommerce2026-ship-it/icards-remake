"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { settingsApi, templatesApi } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Kiểu dữ liệu & hằng số (giữ tên trường như bản src gốc)             */
/* ------------------------------------------------------------------ */
type Block = { _id: string; title: string; slug: string; isActive?: boolean; templates?: { _id: string; imgSrc?: string }[] };
type Template = { _id: string; title: string; slug: string; imgSrc?: string };
type Banner = { id?: string; name?: string; displayPage?: string; isEnabled?: boolean; imgSrc?: string; link?: string };

const HERO_FALLBACK = "https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png";
const PLACEHOLDER = (text: string, size: string) =>
  `https://placehold.co/${size}/e6e6e6/999?text=${encodeURIComponent(text)}`;

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

/* ------------------------------------------------------------------ */
/*  Tiện ích giao diện                                                   */
/* ------------------------------------------------------------------ */
function SectionHeader({ sub, title }: { sub: string; title: string }) {
  return (
    <header className="mb-10 text-center md:mb-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lacquer">{sub}</p>
      <h2 className="mt-3 font-display text-3xl font-medium md:text-4xl">{title}</h2>
    </header>
  );
}

const sectionCls = "mx-auto max-w-[1440px] px-5 py-16 lg:px-8 md:py-20";

/* ------------------------------------------------------------------ */
/*  Hero (banner chính)                                                  */
/* ------------------------------------------------------------------ */
function Hero({ banner }: { banner?: Banner }) {
  const img = (
    <img
      src={banner?.imgSrc || HERO_FALLBACK}
      alt={banner?.name ?? "iCards"}
      className="block aspect-[16/9] max-h-[600px] w-full object-cover"
    />
  );
  return <section className="w-full overflow-hidden">{banner?.link ? <a href={banner.link}>{img}</a> : img}</section>;
}

/* ------------------------------------------------------------------ */
/*  Các dịp (carousel cuộn ngang)                                        */
/* ------------------------------------------------------------------ */
function Occasions({ items }: { items: Block[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.offsetWidth * 0.8, behavior: "smooth" });
  };

  const arrow = "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white shadow-md transition hover:scale-105 md:grid";

  return (
    <div className="relative">
      <button aria-label="Trước" onClick={() => scroll(-1)} className={`${arrow} -left-4`}>
        <ChevronLeft className="size-5" />
      </button>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((o) => (
          <Link key={o._id} href="/templates" className="group w-40 shrink-0 snap-start text-center md:w-52">
            <div className="aspect-square overflow-hidden rounded-2xl bg-paper ring-1 ring-line">
              <img
                src={o.templates?.[0]?.imgSrc || PLACEHOLDER(o.title, "324x324")}
                alt={o.title}
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-3 text-sm font-semibold md:text-base">{o.title}</p>
          </Link>
        ))}
      </div>
      <button aria-label="Sau" onClick={() => scroll(1)} className={`${arrow} -right-4`}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lưới mẫu thiệp nổi bật                                               */
/* ------------------------------------------------------------------ */
function FeaturedGrid({ items }: { items: Template[] }) {
  if (!items.length) return <p className="text-center text-muted">Chưa có mẫu thiệp nổi bật nào.</p>;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {items.map((t) => (
        <Link key={t._id} href={`/templates/${t.slug}`} className="group block">
          <div className="aspect-square overflow-hidden bg-paper ring-1 ring-line">
            <img
              src={t.imgSrc || PLACEHOLDER("Thiệp", "365x365")}
              alt={t.title}
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <h3 className="mt-3 line-clamp-2 text-sm font-semibold md:text-base">{t.title}</h3>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Giới thiệu (thu gọn / xem thêm)                                      */
/* ------------------------------------------------------------------ */
function Intro({ html }: { html?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);

  useEffect(() => {
    if (ref.current) setLong(ref.current.scrollHeight > 200);
  }, [html]);

  return (
    <section className={sectionCls}>
      <SectionHeader sub="VỀ CHÚNG TÔI" title="GIỚI THIỆU ICARDS" />

      <div className={`relative mx-auto max-w-4xl overflow-hidden ${!open && long ? "max-h-[200px]" : ""}`}>
        <div
          ref={ref}
          className="space-y-4 text-[15px] leading-relaxed text-muted md:text-base
            [&_h3]:mt-0 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-medium [&_h3]:text-ink
            [&_h4]:mt-6 [&_h4]:font-display [&_h4]:text-xl [&_h4]:font-medium [&_h4]:text-ink
            [&_strong]:font-semibold [&_strong]:text-ink
            [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: html || DEFAULT_INTRO }}
        />
        {!open && long && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-porcelain to-transparent" />
        )}
      </div>

      {long && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-lacquer transition hover:text-lacquer-dark"
          >
            {open ? "Thu gọn" : "Xem thêm"}
            <ChevronDown className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trang chủ                                                            */
/* ------------------------------------------------------------------ */
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
    ]).then(([blocksRes, templatesRes, settingsRes]) => {
      if (!alive) return;

      const blocks: Block[] =
        blocksRes.status === "fulfilled" ? blocksRes.value.data?.data ?? [] : [];
      const usedIds = new Set(blocks.flatMap((b) => b.templates?.map((t) => t._id) ?? []));
      setOccasions(blocks.filter((b) => b.isActive));

      const all: Template[] =
        templatesRes.status === "fulfilled" ? templatesRes.value.data?.data ?? [] : [];
      setFeatured(all.filter((t) => !usedIds.has(t._id)).slice(0, 8));

      if (settingsRes.status === "fulfilled") {
        const s = settingsRes.value.data?.data ?? settingsRes.value.data ?? {};
        setBanners((s.banners ?? []).filter((b: Banner) => b.displayPage === "home" && b.isEnabled));
        setIntroHtml(s.introText || undefined);
      }
    }).finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={`${sectionCls} animate-pulse`}>
        <div className="aspect-[16/9] max-h-[600px] w-full bg-paper-deep" />
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-square bg-paper-deep" />
          ))}
        </div>
      </div>
    );
  }

  const hero = banners.find((b) => b.name?.toLowerCase().includes("chính")) ?? banners[0];
  const secondary = banners.filter((b) => b !== hero).slice(0, 2);

  return (
    <>
      <Hero banner={hero} />

      <main>
        <section className={sectionCls}>
          <SectionHeader sub="NHỮNG CƠ HỘI MỌI NGƯỜI KẾT NỐI THÂN THIẾT" title="NHỮNG DỊP LAN TỎA NIỀM VUI" />
          {occasions.length > 0 ? (
            <Occasions items={occasions} />
          ) : (
            <p className="text-center text-muted">Đang cập nhật các khối...</p>
          )}
        </section>

        <section className={sectionCls}>
          <SectionHeader sub="KHÁM PHÁ NHỮNG MẪU THIỆP ĐỘC ĐÁO" title="MẪU THIỆP NỔI BẬT" />
          <FeaturedGrid items={featured} />
          <div className="mt-12 text-center">
            <Link
              href="/templates"
              className="inline-block border border-ink px-10 py-3.5 text-sm font-semibold tracking-wide transition hover:bg-ink hover:text-white"
            >
              XEM TẤT CẢ
            </Link>
          </div>
        </section>

        {secondary.length > 0 && (
          <section className={`${sectionCls} grid gap-6 md:grid-cols-2`}>
            {secondary.map((b, i) => (
              <a key={b.id ?? i} href={b.link ?? "#"} className="block overflow-hidden rounded-2xl ring-1 ring-line">
                <img src={b.imgSrc} alt={b.name ?? ""} className="aspect-[16/9] w-full object-cover transition duration-500 hover:scale-105" />
              </a>
            ))}
          </section>
        )}

        <Intro html={introHtml} />
      </main>
    </>
  );
}

export default HomepageContent;
