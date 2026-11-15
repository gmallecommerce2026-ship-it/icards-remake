import Link from "next/link";
import { Heart, Palette, ShieldCheck, Users } from "lucide-react";
import { Reveal } from "./Reveal";

const pillars = [
  { icon: Palette, title: "Thiết kế tinh tế", text: "Mỗi mẫu thiệp được chăm chút về chữ, màu và chất liệu để giống một tấm thiệp in thật." },
  { icon: Users, title: "Dễ dùng cho mọi người", text: "Thiệp mở được trên điện thoại và máy tính, kể cả với những người khách lớn tuổi." },
  { icon: ShieldCheck, title: "Thông tin được bảo vệ", text: "Danh sách khách mời và lời chúc chỉ hiển thị với người được chủ thiệp chia sẻ." },
];

export function AboutUs() {
  return (
    <section id="ve-chung-toi" className="mx-auto max-w-7xl px-5 pb-20 lg:pb-28">
      <Reveal>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-lacquer">Về chúng tôi</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              iCards đồng hành cùng những ngày vui của bạn.
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              Chúng tôi tin rằng một lời mời đẹp là cách đầu tiên để khách bước vào câu chuyện của hai bạn. iCards kết hợp thiết kế thủ công với công nghệ quản lý khách mời, để bạn tập trung vào điều quan trọng nhất.
            </p>
            <Link href="/contact" className="mt-8 inline-block rounded-sm border border-ink/15 px-6 py-3 text-sm font-semibold transition hover:border-lacquer hover:text-lacquer">
              Liên hệ với chúng tôi
            </Link>
          </div>

          <div className="grid gap-5">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex gap-5 rounded-sm border border-line bg-white p-6">
                  <span className="grid size-12 shrink-0 place-items-center rounded-sm bg-lacquer-soft text-lacquer">
                    <p.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <p className="flex items-center gap-2 px-1 text-sm text-muted">
              <Heart className="size-4 text-lacquer" aria-hidden /> Được xây dựng bởi người yêu những tấm thiệp đẹp.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
