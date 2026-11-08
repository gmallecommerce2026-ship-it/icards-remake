"use client";
import Link from "next/link";
import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease: EASE },
});

/** Tấm thiệp giấy dựng bằng CSS: hình ảnh chính của trang, mô phỏng đúng tấm thiệp người dùng sẽ gửi */
function StationeryCard() {
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      {/* tấm thiệp phía sau, lệch nhẹ để có chiều sâu */}
      <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rotate-[3deg] border border-line bg-paper-deep" />
      <div className="relative aspect-[5/7] border border-line bg-white shadow-xl">
        <div className="absolute inset-4 border border-[#B8893B]/50" />
        <div className="relative flex h-full flex-col items-center justify-center px-10 text-center text-ink">
          <p className="font-display text-base italic text-muted">Trân trọng kính mời</p>
          <p className="mt-6 font-display text-[2.6rem] font-medium leading-[1.05]">Minh Anh</p>
          <p className="my-1 font-display text-2xl italic text-[#8C6420]">&amp;</p>
          <p className="font-display text-[2.6rem] font-medium leading-[1.05]">Quốc Bảo</p>
          <span aria-hidden className="my-7 block h-px w-14 bg-[#B8893B]" />
          <p className="text-sm tracking-wide text-muted">Chủ nhật · 13.12.2026</p>
          <p className="mt-1 text-sm text-muted">Trung tâm Tiệc cưới Sen Vàng</p>
          {/* con dấu sáp */}
          <div
            aria-hidden
            className="absolute -bottom-5 -right-5 grid size-14 place-items-center rounded-full bg-lacquer font-display text-2xl text-[#F1D9A6] shadow-md"
            style={{ fontFamily: "'Songti SC','Noto Serif CJK SC','SimSun',serif" }}
          >
            囍
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-36 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:px-8 lg:pb-36 lg:pt-44">
        <div>
          <motion.h1
            {...rise(0.05)}
            className="font-display text-[2.75rem] font-medium leading-[1.04] tracking-[-0.015em] text-ink sm:text-6xl lg:text-[4.5rem]"
          >
            Lời mời cưới đẹp,
            <br />
            gửi bằng một đường link.
          </motion.h1>

          <motion.p {...rise(0.2)} className="mt-8 max-w-[34rem] text-lg leading-[1.7] text-muted">
            Chọn mẫu, chỉnh theo câu chuyện của hai bạn, rồi gửi đến từng khách. Ai sẽ đến và lời chúc đều hiện trên một bảng theo dõi.
          </motion.p>

          <motion.div {...rise(0.35)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link href="/sign-up" className="bg-lacquer px-7 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-lacquer-dark">
              Tạo thiệp miễn phí
            </Link>
            <Link href="/invitations" className="group text-[15px] font-semibold text-ink underline decoration-[#B8893B] decoration-1 underline-offset-[6px] transition-colors hover:text-lacquer">
              Xem mẫu thiệp
            </Link>
          </motion.div>

          <motion.p {...rise(0.45)} className="mt-10 text-sm text-muted">
            Không cần cài ứng dụng. Khách mở thiệp trực tiếp trên trình duyệt.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 1.1, ease: EASE }}>
          <StationeryCard />
        </motion.div>
      </div>
    </section>
  );
}
