"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Heart, MessageCircle, Palette, QrCode, Share2, Smartphone, Star, Users } from "lucide-react";
import { templatesApi } from "@/lib/api";
import { Counter, Reveal } from "./Reveal";

/* ---------- Số liệu ---------- */
export function Stats() {
  const items = [
    { n: 12000, s: "+", l: "cặp đôi đã sử dụng" },
    { n: 850000, s: "+", l: "lượt khách mở thiệp" },
    { n: 200, s: "+", l: "mẫu thiệp thiết kế sẵn" },
    { n: 98, s: "%", l: "khách hài lòng" },
  ];
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 lg:grid-cols-4 lg:px-8">
        {items.map((i) => (
          <div key={i.l}>
            <p className="text-4xl font-semibold text-lacquer sm:text-5xl"><Counter to={i.n} suffix={i.s} /></p>
            <p className="mt-1 text-sm text-muted">{i.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Tính năng (bento) ---------- */
export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28 lg:px-8">
      <Reveal className="max-w-2xl">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Mọi việc của ngày cưới liên quan đến khách mời, gói trong một nơi.</h2>
        <p className="mt-4 text-lg text-muted">Từ thiết kế thiệp đến danh sách bàn tiệc, bạn không cần chuyển qua lại giữa bảng tính và tin nhắn nữa.</p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <div className="group relative h-full overflow-hidden rounded-3xl bg-lacquer p-8 text-white">
            <Palette className="size-8 text-gold" />
            <h3 className="mt-5 text-3xl font-semibold">Trình thiết kế kéo thả</h3>
            <p className="mt-3 max-w-md text-white/80">Đổi chữ, phông, màu, hình ảnh và nhạc nền ngay trên khung thiệp. Không cần biết thiết kế.</p>
            <div aria-hidden className="absolute -bottom-10 -right-10 size-56 rounded-full border border-white/20 transition-transform duration-700 group-hover:scale-125" />
            <div aria-hidden className="absolute -bottom-20 -right-20 size-80 rounded-full border border-white/10 transition-transform duration-700 group-hover:scale-125" />
          </div>
        </Reveal>
        <Reveal delay={0.08} className="md:col-span-2">
          <Card icon={<Share2 />} title="Gửi bằng một đường dẫn" text="Mỗi khách nhận liên kết riêng, gửi qua Zalo, Messenger hay SMS." />
        </Reveal>
        <Reveal className="md:col-span-2"><Card icon={<Users />} title="Quản lý khách mời" text="Chia nhóm nhà trai, nhà gái, bạn bè và sắp xếp bàn tiệc." /></Reveal>
        <Reveal delay={0.08} className="md:col-span-2"><Card icon={<BarChart3 />} title="Theo dõi xác nhận" text="Xem ngay ai đến, ai bận và tổng số chỗ cần chuẩn bị." /></Reveal>
        <Reveal delay={0.16} className="md:col-span-2"><Card icon={<MessageCircle />} title="Sổ lời chúc" text="Khách để lại lời chúc, bạn giữ lại như một cuốn lưu bút." /></Reveal>
        <Reveal className="md:col-span-3"><Card icon={<QrCode />} title="Mã QR mừng cưới" text="Gắn mã QR ngân hàng vào thiệp để khách mừng cưới thuận tiện." /></Reveal>
        <Reveal delay={0.08} className="md:col-span-3"><Card icon={<Smartphone />} title="Hiển thị đẹp trên mọi màn hình" text="Thiệp được tối ưu cho điện thoại, nơi khách mở thiệp nhiều nhất." /></Reveal>
      </div>
    </section>
  );
}

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="h-full rounded-3xl border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-lacquer/30 hover:shadow-[0_24px_48px_-24px_rgba(163,21,47,.25)]">
      <span className="grid size-11 place-items-center rounded-xl bg-lacquer-soft text-lacquer [&>svg]:size-5">{icon}</span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted">{text}</p>
    </div>
  );
}

/* ---------- 3 bước (đây là một quy trình có thứ tự thật) ---------- */
export function Steps() {
  const steps = [
    { t: "Chọn mẫu thiệp", d: "Duyệt thư viện theo phong cách, màu sắc hoặc chủ đề đám cưới." },
    { t: "Điền thông tin và chỉnh sửa", d: "Nhập tên, ngày giờ, địa điểm, thêm ảnh cưới và lời mời của bạn." },
    { t: "Gửi và theo dõi", d: "Chia sẻ liên kết, xem khách xác nhận và đọc lời chúc theo thời gian thực." },
  ];
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal><h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Có thiệp trong tay chỉ sau ba bước.</h2></Reveal>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.1}>
              <li className="relative h-full list-none rounded-3xl bg-porcelain p-8">
                <span className="text-6xl font-semibold text-lacquer/20">{i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted">{s.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Mẫu thiệp: lấy từ API, có dữ liệu dự phòng ---------- */
type Tpl = { id: string; name: string; image?: string; href: string; tone: string };
const tones = ["from-rose-100 to-rose-200", "from-amber-50 to-amber-200", "from-stone-100 to-stone-300", "from-red-100 to-red-300"];
const fallback: Tpl[] = ["Hỷ sự truyền thống", "Vườn hoa mùa xuân", "Tối giản hiện đại", "Hoàng gia vàng đỏ"].map((name, i) => ({
  id: String(i), name, href: "/invitations", tone: tones[i],
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalize(data: any): Tpl[] {
  const list: any[] = Array.isArray(data) ? data : data?.data ?? data?.templates ?? data?.items ?? [];
  return list.slice(0, 4).map((t, i) => ({
    id: String(t._id ?? t.id ?? i),
    name: t.name ?? t.title ?? "Mẫu thiệp",
    image: t.thumbnail ?? t.thumbnailUrl ?? t.previewImage ?? t.image,
    href: `/invitation/${t._id ?? t.id ?? t.slug ?? ""}`,
    tone: tones[i % tones.length],
  }));
}

export function Templates() {
  const [items, setItems] = useState<Tpl[]>(fallback);

  useEffect(() => {
    templatesApi.getTemplates({ limit: 4 })
      .then((res) => { const n = normalize(res.data); if (n.length) setItems(n); })
      .catch(() => {}); // giữ dữ liệu dự phòng nếu API lỗi
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:py-28 lg:px-8">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Mẫu thiệp được yêu thích nhất.</h2>
        <Link href="/invitations" className="font-semibold text-lacquer hover:underline">Xem tất cả mẫu</Link>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {items.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.07}>
            <Link href={t.href} className="group block">
              <div className={`relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br ${t.tone}`}>
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} alt={t.name} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="grid size-full place-items-center text-5xl text-lacquer/40 transition duration-700 group-hover:scale-110">囍</div>
                )}
                <span className="absolute inset-x-3 bottom-3 translate-y-3 rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-lacquer opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">Dùng mẫu này</span>
              </div>
              <h3 className="mt-3 font-semibold">{t.name}</h3>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Đánh giá ---------- */
export function Testimonials() {
  const list = [
    { q: "Mình gửi cho 300 khách chỉ trong một buổi tối, và danh sách xác nhận tự cập nhật. Nhà mình đỡ gọi điện rất nhiều.", n: "Thu Hà", r: "Cô dâu, Hà Nội" },
    { q: "Thiệp mở trên điện thoại rất mượt, các cô chú lớn tuổi cũng xem được dễ dàng.", n: "Quốc Bảo", r: "Chú rể, TP.HCM" },
    { q: "Phần sổ lời chúc làm vợ chồng mình đọc mãi không chán. Đó là kỷ niệm đáng giữ.", n: "Phương Linh", r: "Cô dâu, Huế" },
  ];
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal><h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Các cặp đôi nói gì về iCards.</h2></Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {list.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.1}>
              <figure className="flex h-full flex-col justify-between rounded-3xl border border-line bg-porcelain p-8">
                <div>
                  <div className="flex gap-0.5 text-gold" aria-label="5 sao">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-4 fill-current" />)}</div>
                  <blockquote className="mt-4 text-xl leading-relaxed">“{t.q}”</blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-lacquer font-semibold text-white">{t.n[0]}</span>
                  <span><span className="block font-semibold">{t.n}</span><span className="text-sm text-muted">{t.r}</span></span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA cuối ---------- */
export function FinalCta() {
  return (
    <section className="px-5 py-20 lg:py-28 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-lacquer to-lacquer-dark px-8 py-16 text-center text-white sm:px-16">
          <Heart aria-hidden className="absolute -left-6 -top-6 size-32 text-white/5" />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Ngày vui của bạn xứng đáng có một tấm thiệp đẹp.</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">Tạo tài khoản và bắt đầu thiết kế ngay. Bạn chỉ trả tiền khi đã ưng ý.</p>
          <Link href="/sign-up" className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-lacquer transition hover:scale-105">Tạo thiệp miễn phí</Link>
        </div>
      </Reveal>
    </section>
  );
}
