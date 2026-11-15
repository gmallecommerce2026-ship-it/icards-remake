"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { BarChart3, MessageCircle, Palette, QrCode, Share2, Users } from "lucide-react";
import { templatesApi } from "@/lib/api";
import { HOME_BANNERS } from "@/lib/banners";
import { Carousel } from "@/components/ui/Carousel";
import { Counter, Reveal } from "./Reveal";
import { Hero as HeroStationery } from "./Hero";

/* ------------------------------------------------------------------ */
/*  Theme hiện tại (đọc từ <html data-theme>, cập nhật khi bấm 1–5)      */
/* ------------------------------------------------------------------ */
function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}
const current = () => document.documentElement.dataset.theme ?? "1";
const server = () => "1";
export function useUiTheme() {
  return useSyncExternalStore(subscribe, current, server);
}

/* ------------------------------------------------------------------ */
/*  Nội dung dùng chung (sửa ở đây là đổi cả 5 giao diện)               */
/* ------------------------------------------------------------------ */
const STATS = [
  { n: 12000, s: "+", l: "cặp đôi đã sử dụng" },
  { n: 850000, s: "+", l: "lượt khách mở thiệp" },
  { n: 200, s: "+", l: "mẫu thiệp thiết kế sẵn" },
  { n: 98, s: "%", l: "khách hài lòng" },
];

const FEATURES = [
  { icon: Palette, title: "Trình thiết kế kéo thả", text: "Đổi chữ, phông, màu, hình ảnh và nhạc nền ngay trên khung thiệp." },
  { icon: Share2, title: "Gửi bằng một đường dẫn", text: "Mỗi khách nhận liên kết riêng, gửi qua Zalo, Messenger hay SMS." },
  { icon: Users, title: "Quản lý khách mời", text: "Chia nhóm nhà trai, nhà gái, bạn bè và sắp xếp bàn tiệc." },
  { icon: BarChart3, title: "Theo dõi xác nhận", text: "Xem ngay ai đến, ai bận và tổng số chỗ cần chuẩn bị." },
  { icon: MessageCircle, title: "Sổ lời chúc", text: "Khách để lại lời chúc, bạn giữ lại như một cuốn lưu bút." },
  { icon: QrCode, title: "Mã QR mừng cưới", text: "Gắn mã QR ngân hàng vào thiệp để khách mừng cưới thuận tiện." },
];

const STEPS = [
  { t: "Chọn mẫu thiệp", d: "Duyệt thư viện theo phong cách, màu sắc hoặc chủ đề đám cưới." },
  { t: "Điền thông tin và chỉnh sửa", d: "Nhập tên, ngày giờ, địa điểm, thêm ảnh cưới và lời mời của bạn." },
  { t: "Gửi và theo dõi", d: "Chia sẻ liên kết, xem khách xác nhận và đọc lời chúc theo thời gian thực." },
];

const TESTIMONIALS = [
  { q: "Mình gửi cho 300 khách chỉ trong một buổi tối, và danh sách xác nhận tự cập nhật. Nhà mình đỡ gọi điện rất nhiều.", n: "Thu Hà", r: "Cô dâu, Hà Nội" },
  { q: "Thiệp mở trên điện thoại rất mượt, các cô chú lớn tuổi cũng xem được dễ dàng.", n: "Quốc Bảo", r: "Chú rể, TP.HCM" },
  { q: "Phần sổ lời chúc làm vợ chồng mình đọc mãi không chán. Đó là kỷ niệm đáng giữ.", n: "Phương Linh", r: "Cô dâu, Huế" },
];

const PILLARS = [
  { t: "Thiết kế tinh tế", d: "Mỗi mẫu thiệp được chăm chút về chữ, màu và chất liệu để giống một tấm thiệp in thật." },
  { t: "Dễ dùng cho mọi người", d: "Thiệp mở được trên điện thoại và máy tính, kể cả với những người khách lớn tuổi." },
  { t: "Thông tin được bảo vệ", d: "Danh sách khách mời và lời chúc chỉ hiển thị với người được chủ thiệp chia sẻ." },
];

export type Tpl = { id: string; name: string; image?: string; href: string };

const FALLBACK_TEMPLATES: Tpl[] = ["Hỷ sự truyền thống", "Vườn hoa mùa xuân", "Tối giản hiện đại", "Hoàng gia vàng đỏ"].map((name, i) => ({
  id: String(i), name, href: "/invitations",
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeTemplates(data: any): Tpl[] {
  const list: any[] = Array.isArray(data) ? data : data?.data ?? data?.templates ?? data?.items ?? [];
  return list.slice(0, 4).map((t, i) => ({
    id: String(t._id ?? t.id ?? i),
    name: t.name ?? t.title ?? "Mẫu thiệp",
    image: t.thumbnail ?? t.thumbnailUrl ?? t.previewImage ?? t.image,
    href: `/templates/${t.slug ?? ""}`,
  }));
}

type LayoutProps = { templates: Tpl[] };

/* ================================================================== */
/*  GIAO DIỆN 1 · THIỆP GIẤY                                             */
/*  Đối xứng, cột giữa, serif, đường kẻ mảnh như tấm thiệp in.           */
/* ================================================================== */
function Theme1({ templates }: LayoutProps) {
  return (
    <>
      <HeroStationery />

      <section className="border-y border-line bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {STATS.map((i, k) => (
            <div key={i.l} className={`px-6 py-14 text-center ${k > 0 ? "border-l border-line" : ""} ${k > 1 ? "max-lg:border-t border-line" : ""}`}>
              <p className="font-display text-5xl font-medium text-lacquer"><Counter to={i.n} suffix={i.s} /></p>
              <p className="mt-2 text-sm text-muted">{i.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl font-medium leading-[1.1] sm:text-5xl">Mọi việc của ngày cưới, gói trong một nơi.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">Từ thiết kế thiệp đến danh sách bàn tiệc, bạn không cần chuyển qua lại giữa bảng tính và tin nhắn.</p>
        </Reveal>
        <div className="mt-16 grid border-l border-t border-line md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="border-b border-r border-line p-9 text-center">
              <f.icon className="mx-auto size-6 text-lacquer" aria-hidden />
              <h3 className="mt-5 font-display text-2xl font-medium">{f.title}</h3>
              <p className="mt-3 text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <h2 className="font-display text-4xl font-medium sm:text-5xl">Có thiệp trong tay chỉ sau ba bước.</h2>
          <ol className="mt-16 grid gap-12 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="list-none">
                <span className="font-display text-5xl italic text-gold">{["I", "II", "III"][i]}</span>
                <h3 className="mt-4 font-display text-2xl font-medium">{s.t}</h3>
                <p className="mx-auto mt-3 max-w-xs text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TemplatesGrid templates={templates} variant="centered" />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><Carousel slides={HOME_BANNERS} /></div>

      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-4xl font-medium sm:text-5xl">Các cặp đôi nói gì về iCards.</h2>
          <div className="mt-14 space-y-14">
            {TESTIMONIALS.slice(0, 2).map((t) => (
              <figure key={t.n}>
                <blockquote className="font-display text-2xl italic leading-relaxed sm:text-3xl">“{t.q}”</blockquote>
                <figcaption className="mt-5 text-sm text-muted">{t.n} · {t.r}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl border border-line bg-paper p-3">
          <div className="border border-[#B8893B]/60 px-8 py-16 text-center">
            <h2 className="font-display text-4xl font-medium sm:text-5xl">Ngày vui của bạn xứng đáng có một tấm thiệp đẹp.</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted">Tạo tài khoản và bắt đầu thiết kế ngay. Bạn chỉ trả tiền khi đã ưng ý.</p>
            <Link href="/sign-up" className="mt-9 inline-block bg-lacquer px-8 py-4 font-semibold text-white transition-colors hover:bg-lacquer-dark">Tạo thiệp miễn phí</Link>
          </div>
        </div>
      </section>

      <AboutBlock variant="centered" />
    </>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 2 · TỐI GIẢN                                               */
/*  Lưới chặt kiểu Thụy Sĩ, sans, căn trái, toàn đường kẻ, không trang trí, không chuyển động. */
/* ================================================================== */
function Theme2({ templates }: LayoutProps) {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-40 lg:grid-cols-12 lg:px-8 lg:pb-28">
          <div className="lg:col-span-8">
            <h1 className="font-display text-[3.25rem] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-7xl lg:text-[5.5rem]">
              Lời mời cưới,<br />gửi bằng một đường link.
            </h1>
          </div>
          <div className="flex flex-col justify-end gap-8 lg:col-span-4">
            <p className="text-lg leading-relaxed text-muted">Chọn mẫu, chỉnh theo câu chuyện của hai bạn, rồi gửi đến từng khách. Ai đến và lời chúc đều hiện trên một bảng theo dõi.</p>
            <div className="flex gap-3">
              <Link href="/sign-up" className="bg-ink px-6 py-3.5 text-sm font-semibold text-white">Tạo thiệp miễn phí</Link>
              <Link href="/invitations" className="border border-ink px-6 py-3.5 text-sm font-semibold">Xem mẫu</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 border-b border-line bg-white lg:grid-cols-4">
        {STATS.map((i, k) => (
          <div key={i.l} className={`p-8 lg:p-10 ${k > 0 ? "border-l border-line" : ""}`}>
            <p className="font-display text-4xl font-semibold"><Counter to={i.n} suffix={i.s} /></p>
            <p className="mt-2 text-sm text-muted">{i.l}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <h2 className="font-display text-4xl font-semibold tracking-tight lg:col-span-5 lg:text-5xl">Mọi việc của ngày cưới, một nơi.</h2>
          <ul className="lg:col-span-7">
            {FEATURES.map((f) => (
              <li key={f.title} className="grid gap-2 border-t border-line py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-8">
                <span className="font-semibold">{f.title}</span>
                <span className="text-muted">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 lg:grid-cols-3 lg:px-8">
          {STEPS.map((s, i) => (
            <div key={s.t} className="border-t-2 border-ink pt-6">
              <p className="text-sm text-muted">Bước {i + 1}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{s.t}</h3>
              <p className="mt-3 text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-10 flex items-end justify-between border-b border-ink pb-4">
          <h2 className="font-display text-3xl font-semibold">Mẫu được dùng nhiều</h2>
          <Link href="/invitations" className="text-sm font-semibold">Xem tất cả</Link>
        </div>
        <ul>
          {templates.map((t) => (
            <li key={t.id}>
              <Link href={t.href} className="group flex items-center justify-between border-b border-line py-5 transition-colors hover:bg-paper">
                <span className="font-display text-2xl font-semibold">{t.name}</span>
                <span className="text-sm text-muted group-hover:text-ink">Xem mẫu</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><Carousel slides={HOME_BANNERS} /></div>

      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
          {TESTIMONIALS.map((t) => (
            <figure key={t.n} className="border-l-2 border-ink pl-6">
              <blockquote className="text-xl leading-relaxed">{t.q}</blockquote>
              <figcaption className="mt-4 text-sm text-muted">{t.n}, {t.r}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 bg-ink p-10 text-white lg:flex-row lg:items-center lg:p-16">
          <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight">Ngày vui của bạn xứng đáng có một tấm thiệp đẹp.</h2>
          <Link href="/sign-up" className="bg-white px-7 py-4 font-semibold text-ink">Tạo thiệp miễn phí</Link>
        </div>
      </section>

      <AboutBlock variant="left" />
    </>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 3 · HIỆN ĐẠI                                               */
/*  Khối màu toàn chiều rộng, chữ sans lớn, bento không đối xứng, thẻ bo vừa. */
/* ================================================================== */
function Theme3({ templates }: LayoutProps) {
  return (
    <>
      <section className="bg-lacquer text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-40 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:pb-32">
          <div>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Gửi lời mời cưới đẹp chỉ bằng một đường link.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/80">Chọn mẫu, chỉnh theo câu chuyện của hai bạn, rồi gửi đến từng khách. Theo dõi xác nhận ngay trên điện thoại.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/sign-up" className="bg-white px-7 py-4 font-semibold text-lacquer">Tạo thiệp miễn phí</Link>
              <Link href="/invitations" className="border border-white/40 px-7 py-4 font-semibold text-white">Xem mẫu thiệp</Link>
            </div>
          </div>

          {/* bảng theo dõi khách mời: minh hoạ sản phẩm bằng CSS */}
          <div className="bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="font-semibold">Xác nhận tham dự</span>
              <span className="text-sm text-muted">Cập nhật ngay</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[["128", "Sẽ đến"], ["34", "Bận"], ["22", "Chưa trả lời"]].map(([n, l]) => (
                <div key={l} className="bg-paper p-4">
                  <p className="font-display text-3xl font-bold text-lacquer">{n}</p>
                  <p className="mt-1 text-xs text-muted">{l}</p>
                </div>
              ))}
            </div>
            <ul className="mt-5 divide-y divide-line">
              {["Thu Hà", "Quốc Bảo", "Phương Linh"].map((n, i) => (
                <li key={n} className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-3"><span className="grid size-8 place-items-center bg-lacquer-soft text-sm font-semibold text-lacquer">{n[0]}</span>{n}</span>
                  <span className="bg-lacquer-soft px-2.5 py-1 text-xs font-semibold text-lacquer">{["Sẽ đến", "Sẽ đến", "Bận"][i]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {STATS.map((i) => (
            <div key={i.l} className="bg-white p-8">
              <p className="font-display text-4xl font-bold text-lacquer"><Counter to={i.n} suffix={i.s} /></p>
              <p className="mt-2 text-sm text-muted">{i.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <h2 className="max-w-3xl font-display text-4xl font-bold tracking-tight lg:text-6xl">Mọi việc của ngày cưới, trong một ứng dụng.</h2>
        <div className="mt-14 grid gap-4 md:grid-cols-6">
          <div className="bg-lacquer p-8 text-white md:col-span-4 md:row-span-2">
            <Palette className="size-8" />
            <h3 className="mt-6 font-display text-3xl font-bold">{FEATURES[0].title}</h3>
            <p className="mt-3 max-w-md text-white/80">{FEATURES[0].text}</p>
          </div>
          {FEATURES.slice(1).map((f, i) => (
            <div key={f.title} className={`p-7 ${i % 2 === 0 ? "bg-lacquer-soft" : "bg-paper"} md:col-span-2`}>
              <f.icon className="size-6 text-lacquer" />
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-4xl font-bold">Có thiệp trong tay chỉ sau ba bước.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.t} className="bg-white/5 p-8">
                <div className="h-1 w-full bg-white/10"><div className="h-1 bg-lacquer" style={{ width: `${(i + 1) * 33.3}%` }} /></div>
                <h3 className="mt-6 text-xl font-semibold">{s.t}</h3>
                <p className="mt-3 text-white/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TemplatesGrid templates={templates} variant="bold" />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><Carousel slides={HOME_BANNERS} /></div>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.n} className="flex flex-col justify-between bg-paper p-8">
              <blockquote className="text-lg leading-relaxed">“{t.q}”</blockquote>
              <figcaption className="mt-8 text-sm"><span className="font-semibold">{t.n}</span> <span className="text-muted">· {t.r}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 bg-lacquer p-10 text-white lg:flex-row lg:items-center lg:justify-between lg:p-16">
          <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight">Ngày vui của bạn xứng đáng có một tấm thiệp đẹp.</h2>
          <Link href="/sign-up" className="bg-white px-7 py-4 font-semibold text-lacquer">Tạo thiệp miễn phí</Link>
        </div>
      </section>

      <AboutBlock variant="split" />
    </>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 4 · BOHO ẤM                                                */
/*  Khung vòm, nút viên thuốc, serif nghiêng, thẻ chồng lệch nhau.        */
/* ================================================================== */
function Theme4({ templates }: LayoutProps) {
  return (
    <>
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-40 lg:grid-cols-2 lg:px-8 lg:pb-32">
          <div>
            <h1 className="font-display text-[3.2rem] font-medium italic leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
              Lời mời cưới đẹp,<br />gửi bằng một đường link.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">Chọn mẫu, chỉnh theo câu chuyện của hai bạn, rồi gửi đến từng khách một cách nhẹ nhàng.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/sign-up" className="bg-lacquer px-8 py-4 font-semibold text-white">Tạo thiệp miễn phí</Link>
              <Link href="/invitations" className="border border-ink/20 bg-white px-8 py-4 font-semibold">Xem mẫu thiệp</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="rounded-t-full border border-line bg-paper-deep px-10 pb-12 pt-20 text-center">
              <p className="font-display text-lg italic text-muted">Trân trọng kính mời</p>
              <p className="mt-6 font-display text-5xl italic text-ink">Minh Anh</p>
              <p className="my-2 font-display text-3xl text-lacquer">&amp;</p>
              <p className="font-display text-5xl italic text-ink">Quốc Bảo</p>
              <p className="mt-8 text-sm text-muted">Chủ nhật · 13.12.2026</p>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white px-5 py-3 text-sm shadow-lg">
              <span className="font-semibold text-lacquer">128</span> khách đã xác nhận
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((i, k) => (
            <div key={i.l} className={`rounded-t-[120px] bg-white px-6 pb-8 pt-12 text-center ${k % 2 ? "lg:translate-y-6" : ""}`}>
              <p className="font-display text-4xl italic text-lacquer"><Counter to={i.n} suffix={i.s} /></p>
              <p className="mt-2 text-sm text-muted">{i.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <h2 className="mx-auto max-w-2xl text-center font-display text-4xl italic leading-tight sm:text-5xl">Mọi việc của ngày cưới, gói trong một nơi.</h2>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`bg-white p-8 shadow-md ${i % 2 ? "md:translate-y-8" : ""}`}>
              <span className="grid size-12 place-items-center rounded-full bg-lacquer-soft text-lacquer"><f.icon className="size-5" /></span>
              <h3 className="mt-6 font-display text-2xl italic">{f.title}</h3>
              <p className="mt-3 text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper py-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <h2 className="text-center font-display text-4xl italic">Có thiệp trong tay chỉ sau ba bước.</h2>
          <ol className="mt-16 space-y-10">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex items-start gap-6 list-none">
                <span className="grid size-16 shrink-0 place-items-center rounded-t-full border border-line bg-white font-display text-2xl italic text-lacquer">{i + 1}</span>
                <div>
                  <h3 className="font-display text-2xl italic">{s.t}</h3>
                  <p className="mt-2 text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TemplatesGrid templates={templates} variant="arch" />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><Carousel slides={HOME_BANNERS} /></div>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-8">
        <blockquote className="font-display text-3xl italic leading-relaxed sm:text-4xl">“{TESTIMONIALS[0].q}”</blockquote>
        <p className="mt-8 text-muted">{TESTIMONIALS[0].n}, {TESTIMONIALS[0].r}</p>
      </section>

      <section className="px-5 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-t-[260px] bg-lacquer px-8 pb-20 pt-32 text-center text-white">
          <h2 className="mx-auto max-w-2xl font-display text-4xl italic leading-tight sm:text-5xl">Ngày vui của bạn xứng đáng có một tấm thiệp đẹp.</h2>
          <Link href="/sign-up" className="mt-10 inline-block bg-white px-8 py-4 font-semibold text-lacquer">Tạo thiệp miễn phí</Link>
        </div>
      </section>

      <AboutBlock variant="arch" />
    </>
  );
}

/* ================================================================== */
/*  GIAO DIỆN 5 · CỔ ĐIỂN                                                */
/*  Xanh đêm và vàng, bố cục tạp chí, chữ cái đầu đoạn, khung viền kép, số La Mã. */
/* ================================================================== */
function Theme5({ templates }: LayoutProps) {
  return (
    <>
      <section className="bg-lacquer text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-28 pt-40 lg:grid-cols-[1.2fr_.8fr] lg:items-end lg:px-8">
          <div>
            <p className="mb-6 h-px w-20 bg-gold" aria-hidden />
            <h1 className="font-display text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
              Lời mời cưới đẹp, gửi bằng một đường link.
            </h1>
            <div className="mt-10 flex flex-wrap gap-6">
              <Link href="/sign-up" className="bg-white px-8 py-4 font-semibold text-lacquer">Tạo thiệp miễn phí</Link>
              <Link href="/invitations" className="border-b border-gold pb-1 text-white">Xem mẫu thiệp</Link>
            </div>
          </div>
          <div className="border border-gold/60 p-2">
            <div className="border border-gold/60 px-8 py-12 text-center">
              <p className="font-display text-lg italic text-white/70">Trân trọng kính mời</p>
              <p className="mt-6 font-display text-4xl">Minh Anh &amp; Quốc Bảo</p>
              <span className="mx-auto my-7 block h-px w-16 bg-gold" aria-hidden />
              <p className="text-sm text-white/70">Chủ nhật, 13 tháng 12 năm 2026</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 lg:grid-cols-4 lg:px-8">
          {STATS.map((i, k) => (
            <div key={i.l} className={`px-6 py-12 ${k > 0 ? "border-l border-gold/50" : ""}`}>
              <p className="font-display text-5xl text-lacquer"><Counter to={i.n} suffix={i.s} /></p>
              <p className="mt-2 text-sm text-muted">{i.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-28 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr]">
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">Mọi việc của ngày cưới, gói trong một nơi.</h2>
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t border-gold pt-5">
                <h3 className="font-display text-2xl">{f.title}</h3>
                <p className="mt-2 text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center font-display text-4xl sm:text-5xl">Có thiệp trong tay chỉ sau ba bước.</h2>
          <ol className="mt-20 grid gap-12 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="list-none text-center">
                <span className="font-display text-3xl italic text-gold">{["I", "II", "III"][i]}</span>
                <h3 className="mt-4 font-display text-2xl">{s.t}</h3>
                <p className="mx-auto mt-3 max-w-xs text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TemplatesGrid templates={templates} variant="framed" />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><Carousel slides={HOME_BANNERS} /></div>

      <section className="border-y border-gold/50 bg-paper py-28">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <p className="font-display text-7xl leading-none text-gold" aria-hidden>“</p>
          <blockquote className="font-display text-3xl italic leading-relaxed sm:text-4xl">{TESTIMONIALS[1].q}</blockquote>
          <p className="mt-8 text-sm text-muted">{TESTIMONIALS[1].n}, {TESTIMONIALS[1].r}</p>
        </div>
      </section>

      <section className="px-5 py-28 lg:px-8">
        <div className="mx-auto max-w-5xl border border-gold p-3">
          <div className="bg-lacquer px-10 py-20 text-center text-white">
            <h2 className="font-display text-4xl sm:text-5xl">Ngày vui của bạn xứng đáng có một tấm thiệp đẹp.</h2>
            <Link href="/sign-up" className="mt-10 inline-block bg-white px-8 py-4 font-semibold text-lacquer">Tạo thiệp miễn phí</Link>
          </div>
        </div>
      </section>

      <AboutBlock variant="editorial" />
    </>
  );
}

/* ================================================================== */
/*  Các khối dùng chung có biến thể theo giao diện                       */
/* ================================================================== */
function TemplatesGrid({ templates, variant }: { templates: Tpl[]; variant: "centered" | "bold" | "arch" | "framed" }) {
  const wrap = variant === "framed" ? "border border-gold/60 p-6" : "";
  return (
    <section className={`mx-auto max-w-7xl px-5 py-24 lg:px-8 ${wrap}`}>
      <div className={`flex flex-wrap items-end justify-between gap-4 ${variant === "centered" ? "flex-col text-center" : ""}`}>
        <h2 className="max-w-xl font-display text-4xl leading-tight sm:text-5xl">Mẫu thiệp được yêu thích nhất.</h2>
        <Link href="/invitations" className="font-semibold text-lacquer hover:underline">Xem tất cả mẫu</Link>
      </div>
      <div className={`mt-14 grid gap-6 ${variant === "bold" ? "lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-4"}`}>
        {templates.map((t) => (
          <Link key={t.id} href={t.href} className="group block">
            <div className={`relative aspect-[3/4] overflow-hidden ${variant === "arch" ? "rounded-t-full" : variant === "bold" ? "rounded-lg" : "border border-line"} bg-paper-deep`}>
              {t.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.image} alt={t.name} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
              ) : (
                <div className="grid size-full place-items-center font-display text-6xl text-lacquer/40">囍</div>
              )}
            </div>
            <h3 className={`mt-4 font-display text-xl ${variant === "centered" || variant === "framed" ? "text-center" : ""}`}>{t.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AboutBlock({ variant }: { variant: "centered" | "left" | "split" | "arch" | "editorial" }) {
  const heading = (
    <>
      <p className="text-sm font-semibold text-lacquer">Về chúng tôi</p>
      <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">iCards đồng hành cùng những ngày vui của bạn.</h2>
      <p className="mt-6 max-w-xl leading-relaxed text-muted">Chúng tôi tin rằng một lời mời đẹp là cách đầu tiên để khách bước vào câu chuyện của hai bạn.</p>
      <Link href="/contact" className="mt-8 inline-block border-b border-ink pb-1 font-semibold">Liên hệ với chúng tôi</Link>
    </>
  );
  const pillars = (
    <div className="grid gap-4">
      {PILLARS.map((p) => (
        <div key={p.t} className={`p-6 ${variant === "arch" ? "rounded-t-full bg-white pb-8 pt-10 text-center" : "border border-line bg-white"}`}>
          <h3 className="font-display text-xl">{p.t}</h3>
          <p className="mt-2 text-sm text-muted">{p.d}</p>
        </div>
      ))}
    </div>
  );
  if (variant === "centered" || variant === "arch") {
    return (
      <section className="mx-auto max-w-4xl px-5 py-24 text-center lg:px-8">
        {heading}
        <div className="mt-14 grid gap-6 md:grid-cols-3">{PILLARS.map((p) => (
          <div key={p.t} className={variant === "arch" ? "rounded-t-full bg-white px-6 pb-8 pt-12" : "border-t border-line pt-6"}>
            <h3 className="font-display text-xl">{p.t}</h3>
            <p className="mt-2 text-sm text-muted">{p.d}</p>
          </div>
        ))}</div>
      </section>
    );
  }
  if (variant === "editorial") {
    return (
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-28 lg:grid-cols-2 lg:px-8">
        <div className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-none first-letter:text-lacquer">{heading}</div>
        <div className="space-y-8 border-l border-gold pl-10">{PILLARS.map((p) => (
          <div key={p.t}><h3 className="font-display text-2xl">{p.t}</h3><p className="mt-2 text-muted">{p.d}</p></div>
        ))}</div>
      </section>
    );
  }
  if (variant === "split") {
    return (
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div>{heading}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{PILLARS.map((p) => (
          <div key={p.t} className="bg-lacquer p-6 text-white"><h3 className="font-bold">{p.t}</h3><p className="mt-2 text-sm text-white/80">{p.d}</p></div>
        ))}</div>
      </section>
    );
  }
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8">
      <div>{heading}</div>
      {pillars}
    </section>
  );
}

/* ================================================================== */
/*  Điểm vào: chọn bố cục theo giao diện đang bật                        */
/* ================================================================== */
const LAYOUTS: Record<string, (p: LayoutProps) => React.ReactElement> = {
  "1": Theme1,
  "2": Theme2,
  "3": Theme3,
  "4": Theme4,
  "5": Theme5,
};

export function HomeView() {
  const theme = useUiTheme();
  const [templates, setTemplates] = useState<Tpl[]>(FALLBACK_TEMPLATES);

  useEffect(() => {
    templatesApi.getTemplates({ limit: 4 })
      .then((res) => { const n = normalizeTemplates(res.data); if (n.length) setTemplates(n); })
      .catch(() => {});
  }, []);

  const Layout = LAYOUTS[theme] ?? Theme1;
  return <Layout templates={templates} />;
}

