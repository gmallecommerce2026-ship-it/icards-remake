"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  FileSpreadsheet,
  Link2,
  Mail,
  MapPin,
  MessageSquareHeart,
  MessageCircle,
  Navigation,
  Palette,
  QrCode,
  Send,
  Upload,
  Users,
  Images,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { settingsApi, templatesApi } from "@/lib/api";
import { templatesOf } from "@/lib/api/list";
import type { InvitationTemplate } from "@/lib/templates";
import { TemplateShowcase } from "@/components/templates/TemplateShowcase";
import { BannerGroupList } from "@/components/banners/BannerGroupView";
import { Container } from "@/components/ui/Primitives";
import { AdBanner } from "@/components/ads/AdBanner";
import { groupsFor, type BannerGroupData } from "@/lib/banner-groups";
import { SideAdsShell } from "@/components/ads/SideAdsShell";
import EditorDemo from "@/components/professional/EditorDemo";

type Template = InvitationTemplate & { _id: string; title: string; imgSrc?: string };

const IMG = {
  feature: "https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f1.png",
  print: "https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/f2.png",
  download: "https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herotutorial.png",
};

const FAQ = [
  { q: "Thiệp mời online là gì?", a: "Thiệp mời online là thiệp mời trên nền tảng số trực tuyến, thay vì được in ra giấy như các tấm thiệp mời truyền thống. Sau khi tạo thiệp mời online, bạn sẽ gửi tấm thiệp tới khách mời thông qua tin nhắn hoặc mạng xã hội như Facebook, Zalo,... Khi đó, khách mời chỉ cần có kết nối Internet là đã có thể xem được tấm thiệp mời của bạn." },
  { q: "Thiệp mời online và thiệp mời truyền thống khác nhau thế nào?", a: "Thiệp mời online và thiệp mời truyền thống có nhiều điểm khác biệt, chủ yếu ở hình thức, thiết kế, cách truyền tải thông tin đám cưới và cách gửi thiệp:\n\n1. Với thiệp mời truyền thống: Là thiệp in giấy, với những thiết kế phổ thông, khó thay đổi theo mong muốn cá nhân, chi phí in ấn cao, hình thức gửi thiệp là tay trao tay cho khách mời. Hiện nay, đa phần mọi người bắt đầu dùng thiệp bán online, ví dụ như chụp hình thiệp truyền thống để gửi qua tin nhắn hoặc mạng xã hội, hoặc tự thiết kế rồi xuất thành hình ảnh để gửi cho khách mời.\n\n2. Với thiệp mời online: Là thiệp bạn tự thiết kế trên nền tảng thiết kế thiệp mời online, với đa dạng mẫu thiết kế và cá nhân hoá theo sở thích. Không cần in ấn nên tiết kiệm chi phí. Có tính năng quản lý danh sách khách mời, và gửi thiệp cho từng khách bằng một liên kết online qua internet như tin nhắn, Facebook, Zalo,..." },
  { q: "Lợi ích của thiệp mời online là gì?", a: "Không đơn thuần là một tấm thiệp, thiệp mời online là một sự kết hợp hoàn hảo với nền tảng số.\n\nCá nhân hóa thiết kế, để sự kiện trở nên ấn tượng hơn. Tiết kiệm chi phí in ấn thiệp mời, góp phần bảo vệ môi trường. Quản lý thông tin khách mời dễ dàng và cho phép khách mời xác nhận tham dự, giúp bạn lên kế hoạch cho sự kiện chu toàn hơn. Dễ dàng gửi thiệp mời qua Facebook, Zalo, SMS hoặc email cho tất cả khách mời." },
  { q: "Tôi có thể đặt in thiệp mời được không?", a: "Được, bạn có thể thiết kế thiệp mời và trực tiếp đặt in trên nền tảng iCards. Chúng tôi cung cấp dịch vụ in ấn chất lượng và chuyển thiệp tận nơi, giúp biến thiết kế của bạn thành những tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền.\n\nNgoài ra, bạn cũng có thể tải xuống bản thiết kế, sau đó đặt in ở bất kỳ nhà in thiệp mời nào bạn muốn." },
  { q: "Thời gian in và nhận thiệp bao lâu?", a: "Thời gian in và nhận thiệp tuỳ thuộc vào loại thiệp bạn chọn (giấy in, chi tiết trên thiệp, cách điệu thiệp,...) và địa điểm giao nhận. Thông thường bạn sẽ nhận được thiệp sau 7 - 10 ngày kể từ khi đặt in. Trong trường hợp cần in thiệp gấp, vui lòng liên hệ admin để được hỗ trợ." },
];

const BENEFITS: [string, string][] = [
  ["Mẫu thiệp", "Đa dạng phong cách"],
  ["Quản lý khách", "Xác nhận tham dự"],
  ["In ấn tận nơi", "Đúng cam kết chất lượng"],
  ["Tải bản thiết kế", "In ở bất kỳ đâu"],
];

const DESIGN_FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Palette, title: "Sửa từng chi tiết", description: "Đổi màu, phông chữ, bố cục, hoa văn và khung ảnh trên mọi trang thiệp bằng trình thiết kế kéo thả." },
  { icon: Upload, title: "Thêm ảnh, logo, video, nhạc", description: "Tải lên ảnh cưới, logo thương hiệu, video YouTube và bài hát yêu thích để thiệp mang dấu ấn riêng." },
  { icon: Mail, title: "Phong bì, lót và con dấu sáp", description: "Chọn màu phong bì theo màu thiệp, lót hoa văn và con dấu có chữ viết tắt. Khách chạm để mở phong bì." },
  { icon: Eye, title: "Xem trước ngay", description: "Bản xem thử hiển thị ngay trên trang, chưa lưu lên hệ thống. Bạn chỉnh đến khi ưng ý rồi mới tạo thiệp." },
];

const EVENT_FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: MapPin, title: "Lịch trình và bản đồ", description: "Liệt kê lễ ăn hỏi, lễ thành hôn, tiệc báo hỷ kèm giờ, địa điểm và nút chỉ đường Google Maps." },
  { icon: Images, title: "Album ảnh và video", description: "Trình chiếu ảnh cưới, bộ sưu tập khoảnh khắc và video ngay trong trang thiệp." },
  { icon: CalendarClock, title: "Đếm ngược và lưu vào lịch", description: "Đồng hồ đếm ngược tới ngày vui. Khách có thể lưu sự kiện vào lịch điện thoại kèm lời nhắc." },
  { icon: QrCode, title: "Mã QR mừng cưới", description: "Đặt mã QR ngân hàng của cô dâu, chú rể để khách ở xa gửi quà mừng tiện lợi." },
  { icon: MessageSquareHeart, title: "Sổ lời chúc", description: "Khách gửi lời chúc ngay trên thiệp. Bạn đọc, duyệt và giữ lại làm kỷ niệm." },
];

const SHARE_FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Link2, title: "Link riêng gọi đúng tên", description: "Mỗi khách nhận một đường link riêng, thiệp hiện đúng tên và cách xưng hô." },
  { icon: Send, title: "Gửi qua mọi kênh", description: "Gửi bằng Zalo, Messenger, email, tin nhắn hoặc đăng lên mạng xã hội." },
  { icon: FileSpreadsheet, title: "Nhập người nhận từ Excel", description: "Tải danh sách khách một lần, iCards tự tạo link riêng gọi đúng tên cho từng người." },
  { icon: Users, title: "Xác nhận tham dự", description: "Khách xác nhận tham dự ngay trên thiệp. Bạn theo dõi tỷ lệ xác nhận trong trang quản lý sự kiện." },
];

const PROCESS = ["Chọn mẫu thiệp", "Chỉnh sửa", "Đặt in", "Nhận thiệp"];
const TEMPLATE_GRID = "grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4";

/* Khối dùng chung: cùng padding ngang (Container) và cùng khoảng cách dọc. */
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
      {eyebrow && (
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-lacquer">
          <span aria-hidden className="h-px w-6 bg-lacquer" />
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}

/* Mục tính năng: icon tròn + tiêu đề + mô tả, hiển thị dạng danh sách */
function FeatureItem({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lacquer-soft text-lacquer">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </li>
  );
}

/* Thẻ mẫu thiệp trong lưới */
function ProTemplateCard({ template }: { template: Template }) {
  return (
    <Link href={`/templates/${template.slug}`} className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lacquer">
      <TemplateShowcase template={template} />
      <h3 className="mt-4 truncate text-center text-base font-bold text-ink transition-colors group-hover:text-lacquer">{template.title}</h3>
    </Link>
  );
}

/* Minh hoạ: thẻ thông tin sự kiện với lịch trình và bản đồ */
function EventMock() {
  const rows = [
    { time: "09:00", text: "Lễ ăn hỏi · Tư gia nhà gái" },
    { time: "11:00", text: "Lễ thành hôn · Grand Palace" },
  ];
  return (
    <div className="mx-auto w-full max-w-md border border-line bg-white p-6 shadow-[0_24px_60px_-30px_rgba(39,84,138,.35)] sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Lịch trình</p>
      <ul className="mt-4 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.time} className="flex items-center gap-4 py-3.5">
            <span className="w-14 text-sm font-bold tabular-nums text-lacquer">{r.time}</span>
            <span className="text-sm text-ink">{r.text}</span>
          </li>
        ))}
      </ul>
      <div className="relative mt-5 h-40 overflow-hidden rounded-sm bg-[#E8EEF7]">
        <div aria-hidden className="absolute -left-10 top-0 h-full w-24 rotate-[18deg] bg-[#D6EBD3]" />
        <div aria-hidden className="absolute bottom-1/2 left-1/2 size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#D0788C] ring-4 ring-white" />
        <span className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-lacquer px-4 text-xs font-semibold text-white shadow-md">
          <Navigation className="size-3.5" aria-hidden />
          Chỉ đường
        </span>
      </div>
    </div>
  );
}

/* Minh hoạ: đường link riêng và các kênh gửi */
function ShareMock() {
  const channels = ["Zalo", "Messenger", "Email", "SMS"];
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 border border-line bg-white p-8 sm:p-10">
      <div className="flex w-full items-center gap-3 rounded-full border border-line bg-porcelain px-5 py-3.5">
        <Link2 className="size-4 shrink-0 text-lacquer" aria-hidden />
        <p className="min-w-0 truncate text-sm text-ink">
          icards.com.vn/events/<span className="font-semibold text-lacquer">minhanh-hoan…</span>
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        {channels.map((c) => (
          <span key={c} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink shadow-sm">
            <MessageCircle className="size-3.5 text-muted" aria-hidden />
            {c}
          </span>
        ))}
      </div>
      <p className="text-center text-xs leading-relaxed text-muted">Mỗi khách nhận một đường link riêng, gọi đúng tên và cách xưng hô.</p>
    </div>
  );
}

export default function TutorialPage() {
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showcaseTemplates, setShowcaseTemplates] = useState<Template[]>([]);
  const [bannerGroups, setBannerGroups] = useState<BannerGroupData[]>([]);
  const bannerSecondary = IMG.download;

  useEffect(() => {
    settingsApi
      .getPublicSettings()
      .then((res) => {
        const s = res.data?.data ?? res.data ?? {};
        setBannerGroups(s.bannerGroups ?? []);
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

  // Banner trang chuyên nghiệp do admin quản lý: nhóm đầu trang là hero, nhóm cuối trang nằm trên chân trang
  const heroTop = groupsFor(bannerGroups, "professional", "top");
  const bottomGroups = groupsFor(bannerGroups, "professional", "bottom");

  return (
    // tone-blue: ép màu thương hiệu #27548A cho toàn trang, không theo theme 1–5
    <div className="tone-blue bg-[#FEFDFD] text-ink">
      <SideAdsShell hero={<BannerGroupList groups={heroTop} heroFirst />}>
        {/* Hero */}
        <section aria-label="Giới thiệu" className="border-b border-line bg-white">
          <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:py-24">
            <div className="flex flex-col items-start gap-6">
              <p className="inline-flex items-center gap-2 rounded-sm bg-lacquer-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-lacquer">
                <span aria-hidden className="size-1.5 rounded-full bg-lacquer" />
                Thiệp mời online
              </p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                Thiệp mời đẹp, gửi đúng người, quản lý trong một nơi
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Thiết kế thiệp theo ý bạn, thêm thông tin sự kiện và gửi tới từng khách mời bằng một đường link riêng. Mọi thứ cho ngày trọng đại nằm trong một nơi.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/templates" className="inline-flex h-12 items-center gap-2 rounded-sm bg-lacquer px-6 text-sm font-semibold text-white transition-colors hover:bg-lacquer-dark">
                  Chọn mẫu thiệp
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="#trinh-sua-thiep" className="inline-flex h-12 items-center gap-2 rounded-sm border border-line bg-white px-6 text-sm font-semibold text-ink transition-colors hover:border-ink">
                  Dùng thử trình sửa thiệp
                </Link>
              </div>
            </div>
            <div className="relative">
              <div aria-hidden className="absolute -inset-4 -z-10 bg-lacquer-soft" />
              <div className="border border-line bg-porcelain p-6 sm:p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.download} alt="Giao diện thiệp mời online" className="mx-auto max-h-[420px] w-auto object-contain" />
              </div>
            </div>
          </Container>
        </section>

        {/* Dải lợi ích nhanh */}
        <section aria-label="Lợi ích" className="border-b border-line bg-white">
          <Container className="grid grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(([a, b]) => (
              <div key={a} className="border-b border-line px-5 py-6 lg:border-b-0 lg:border-l lg:first:border-l-0 lg:first:pl-0">
                <p className="text-sm font-bold text-ink">{a}</p>
                <p className="mt-1 text-sm text-muted">{b}</p>
              </div>
            ))}
          </Container>
        </section>

        {/* Thiết kế theo ý bạn */}
        <Section label="Thiết kế">
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeader align="left" eyebrow="Thiết kế" title="Thiết kế theo ý bạn" subtitle="Từ màu sắc đến từng chi tiết nhỏ, mọi thứ đều có thể chỉnh để thiệp đúng với câu chuyện của bạn." />
              <ul className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-x-10">
                {DESIGN_FEATURES.map((f) => <FeatureItem key={f.title} icon={f.icon} title={f.title} description={f.description} />)}
              </ul>
            </div>
            <div className="relative">
              <div aria-hidden className="absolute -inset-4 -z-10 bg-lacquer-soft" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.feature} alt="Minh hoạ thiết kế thiệp" className="mx-auto w-full max-w-md object-contain drop-shadow-xl" />
            </div>
          </div>
        </Section>

        {/* Thông tin sự kiện */}
        <Section label="Thông tin sự kiện">
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <SectionHeader align="left" eyebrow="Sự kiện" title="Thông tin sự kiện" subtitle="Khách mời biết rõ lịch trình, địa điểm và có thể lưu sự kiện vào điện thoại chỉ trong vài chạm." />
              <ul className="mt-12 space-y-7">
                {EVENT_FEATURES.map((f) => <FeatureItem key={f.title} icon={f.icon} title={f.title} description={f.description} />)}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <EventMock />
            </div>
          </div>
        </Section>

        {/* Gửi & chia sẻ */}
        <Section className="border-t border-line bg-lacquer-soft/40" label="Gửi và chia sẻ">
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="order-1">
              <ShareMock />
            </div>
            <div className="order-2">
              <SectionHeader align="left" eyebrow="Gửi & chia sẻ" title="Gửi thiệp tới từng khách" subtitle="Một danh sách khách, một lần tải lên. Mỗi người nhận một đường link riêng và thiệp hiện đúng tên của họ." />
              <ul className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-x-10">
                {SHARE_FEATURES.map((f) => <FeatureItem key={f.title} icon={f.icon} title={f.title} description={f.description} />)}
              </ul>
            </div>
          </div>
        </Section>

        {/* Mẫu thiệp nổi bật theo danh mục */}
        <Section className="border-b border-line bg-white" label="Mẫu thiệp nổi bật">
          <SectionHeader eyebrow="Mẫu thiệp" title="Dễ dàng tạo thiệp từ vô vàn mẫu có sẵn" subtitle="Những mẫu thiệp đẹp, chuyên nghiệp và cá nhân hoá, cho ngày trọng đại thêm nhiều ý nghĩa." />
          <div className={`mt-16 ${TEMPLATE_GRID}`}>
            {showcaseTemplates.map((t) => <ProTemplateCard key={t._id} template={t} />)}
          </div>
        </Section>

        <Section label="Quảng cáo">
          <AdBanner
            title="Gói in thiệp và giao tận nơi"
            text="Đặt in thiệp chất lượng cao, nhận hàng trong khoảng 7–10 ngày."
            cta="Xem dịch vụ in"
            href="/shop"
          />
        </Section>

        {/* In ấn */}
        <Section label="In ấn">
          <SectionHeader eyebrow="In ấn & giao tận nơi" title="In ấn chất lượng, chuyển thiệp tận nơi" subtitle="Chúng tôi giúp bạn biến thiết kế thành tấm thiệp mời hoàn chỉnh. Nếu chất lượng bản in không đúng cam kết, liên hệ với chúng tôi để được khắc phục, in lại hoặc hoàn tiền." />
          <div className="mt-16 grid overflow-hidden bg-lacquer text-white lg:grid-cols-2">
            <div className="flex flex-col justify-center gap-8 p-8 sm:p-12 lg:p-16">
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
              <img src={IMG.print} alt="Quy trình in ấn" className="absolute inset-0 size-full object-cover" />
            </div>
          </div>
        </Section>

        {/* Tải bản thiết kế */}
        <Section className="border-t border-line bg-white" label="Tải bản thiết kế">
          <SectionHeader eyebrow="Tự do đặt in" title="Tải xuống bản thiết kế của bạn" subtitle="Tải bản thiết kế về và đặt in ở bất kỳ nơi nào bạn muốn." />
          <div className="mt-16 border border-line bg-porcelain p-6 sm:p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerSecondary} alt="Mẫu thiết kế thiệp" className="mx-auto max-h-[460px] w-auto object-contain" />
          </div>
          <p className="mt-6 border-l-2 border-lacquer bg-lacquer-soft/60 p-4 text-sm leading-relaxed text-muted">
            Lưu ý: Chúng tôi không giải quyết các vấn đề in ấn ở địa điểm khác ngoài nhà cung cấp mà chúng tôi gợi ý.
          </p>
        </Section>

        {/* Khám phá mẫu theo danh mục */}
        <Section className="border-t border-line bg-[#FBF9F6]" label="Khám phá mẫu">
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

        {/* Hỏi đáp */}
        <Section className="border-t border-line bg-white" label="Hỏi đáp">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
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

        {/* Banner cuối trang (admin quản lý) */}
        {bottomGroups.length > 0 && (
          <Section label="Banner">
            <BannerGroupList groups={bottomGroups} />
          </Section>
        )}
      </SideAdsShell>
    </div>
  );
}
