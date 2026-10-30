"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowRight, Check, MessageCircle, Users } from "lucide-react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Hiện dần khi cuộn tới (thay cho animate-ngay-khi-mount: section này nằm dưới hero cuộn nên trước đó animation đã chạy xong khi chưa ai thấy) */
const rise = (delay = 0, y = 28) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { delay, duration: 0.9, ease: EASE_OUT },
});

export function Hero() {
  const [confirmed, setConfirmed] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  const phoneInView = useInView(phoneRef, { once: true, amount: 0.6 });

  // Khoảnh khắc chính của trang: khi chiếc điện thoại hiện ra, khách tự "xác nhận" để người xem thấy luồng hoạt động
  useEffect(() => {
    if (!phoneInView) return;
    const t = setTimeout(() => setConfirmed(true), 1400);
    return () => clearTimeout(t);
  }, [phoneInView]);

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -right-24 top-10 h-[480px] w-[480px] rounded-full bg-lacquer/15 blur-3xl" />
        <div className="animate-drift absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-gold/15 blur-3xl [animation-delay:-6s]" />
      </div>

      {/* BLEND: đầu section mang đúng màu nền của hero cuộn (#F8F8FB) rồi tan dần sang nền của trang -> không có đường ranh giữa hai phần */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-56 bg-gradient-to-b from-[#F8F8FB] via-[#F8F8FB]/70 to-transparent"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-32">
        <div>
          <motion.span
            {...rise(0, 12)}
            className="inline-flex items-center gap-2 rounded-full border border-lacquer/20 bg-lacquer-soft px-4 py-1.5 text-sm font-medium text-lacquer"
          >
            <span className="size-1.5 rounded-full bg-lacquer" /> Hơn 12.000 cặp đôi đã gửi thiệp qua iCards
          </motion.span>

          <motion.h1
            {...rise(0.1, 24)}
            className="mt-6 text-4xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Gửi lời mời cưới đẹp từ chiếc điện thoại, nhận câu trả lời ngay trong tay.
          </motion.h1>

          <motion.p {...rise(0.25, 24)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Chọn mẫu thiệp, chỉnh sửa theo ý bạn, gửi đến từng khách bằng một đường dẫn riêng. Ai đến, ai bận, ai gửi lời chúc đều hiện trên một bảng theo dõi.
          </motion.p>

          <motion.div {...rise(0.4, 24)} className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/sign-up" className="group inline-flex items-center gap-2 rounded-full bg-lacquer px-7 py-4 font-semibold text-white shadow-[0_16px_40px_-12px_rgba(163,21,47,.7)] transition hover:bg-lacquer-dark">
              Tạo thiệp miễn phí <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/invitations" className="rounded-full border border-line bg-white px-7 py-4 font-semibold text-ink transition hover:border-lacquer hover:text-lacquer">Xem mẫu thiệp</Link>
          </motion.div>

          <motion.p {...rise(0.5, 12)} className="mt-6 text-sm text-muted">
            Không cần cài ứng dụng. Khách mở thiệp trực tiếp trên trình duyệt.
          </motion.p>
        </div>

        {/* Điện thoại + thiệp mời */}
        <div ref={phoneRef} className="relative mx-auto w-full max-w-[340px]">
          <motion.div
            initial={{ opacity: 0, y: 48, rotate: 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: 0.2, duration: 1.1, ease: EASE_OUT }}
            className="animate-float"
          >
            <div className="rounded-[2.8rem] border border-ink/10 bg-ink p-3 shadow-[0_40px_80px_-24px_rgba(28,26,36,.5)]">
              <div className="overflow-hidden rounded-[2.2rem] bg-white">
                <div className="relative flex h-[400px] flex-col items-center justify-center bg-gradient-to-b from-lacquer-soft via-white to-white px-6 text-center">
                  <div className="absolute inset-3 rounded-[1.6rem] border border-gold/50" aria-hidden />
                  <span className="text-4xl text-gold" aria-hidden>囍</span>
                  <p className="mt-4 text-xs text-muted">Trân trọng kính mời bạn đến dự lễ thành hôn</p>
                  <h2 className="mt-3 text-3xl font-semibold leading-tight text-lacquer">Minh Anh<br /><span className="text-xl font-medium italic text-gold">&amp;</span><br />Hoàng Nam</h2>
                  <p className="mt-4 text-sm font-medium text-ink">18:00 · 14.12.2026</p>
                  <p className="text-xs text-muted">Trung tâm Tiệc cưới Hương Giang, Huế</p>
                </div>
                <div className="p-4">
                  <button onClick={() => setConfirmed((c) => !c)} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${confirmed ? "bg-emerald-600 text-white" : "bg-lacquer text-white hover:bg-lacquer-dark"}`}>
                    {confirmed ? (<><Check className="size-4" /> Đã xác nhận tham dự</>) : "Xác nhận tham dự"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {confirmed && (
              <>
                <motion.div key="a" initial={{ opacity: 0, x: 30, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18 }} className="absolute -left-10 top-16 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-xl max-sm:-left-2">
                  <span className="grid size-9 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Users className="size-4" /></span>
                  <div><p className="text-sm font-semibold">Cô Lan xác nhận</p><p className="text-xs text-muted">Đi cùng 2 khách</p></div>
                </motion.div>
                <motion.div key="b" initial={{ opacity: 0, x: -30, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.5 }} className="absolute -right-8 bottom-24 max-w-[200px] rounded-2xl border border-line bg-white px-4 py-3 shadow-xl max-sm:-right-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-lacquer"><MessageCircle className="size-3.5" /> Lời chúc mới</p>
                  <p className="mt-1 text-sm">Chúc hai bạn trăm năm hạnh phúc!</p>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}