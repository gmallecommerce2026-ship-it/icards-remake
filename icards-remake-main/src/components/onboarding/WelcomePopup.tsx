"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

const SEEN_KEY = "icards:welcome-seen";

/** Ba bước tạo thiệp, hiển thị trong popup chào mừng. */
const STEPS = [
  {
    no: "01",
    title: "Chọn mẫu có sẵn",
    text: "Bắt đầu từ mẫu cho cưới, sinh nhật, đầy tháng và nhiều dịp khác.",
  },
  {
    no: "02",
    title: "Cá nhân hóa",
    text: "Thay tên, ngày giờ, địa điểm và lời nhắn. Đổi màu sắc, font chữ, hình ảnh theo ý bạn.",
  },
  {
    no: "03",
    title: "Gửi một đường link",
    text: "Khách mở thiệp ngay trên trình duyệt, không cần cài ứng dụng.",
  },
] as const;

/** Popup chào mừng: chỉ hiện một lần cho mỗi trình duyệt, sau 1 giây kể từ khi vào trang. */
export function WelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* không đọc được bộ nhớ: coi như chưa xem để vẫn hiện một lần */
    }
    if (seen) return;
    const t = window.setTimeout(() => setOpen(true), 1000);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* bỏ qua */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-ink/50 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden bg-white shadow-2xl"
      >
        <div aria-hidden className="h-1.5 bg-[#27548A]" />
        <button type="button" onClick={close} aria-label="Đóng" className="absolute right-4 top-5 grid size-9 place-items-center text-muted hover:bg-porcelain hover:text-ink">
          <X className="size-5" />
        </button>

        <div className="p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#27548A]">Chào mừng đến iCards</p>
          <h2 id="welcome-title" className="mt-3 pr-8 text-2xl font-bold leading-tight tracking-tight text-ink">
            Tạo thiệp mời trong 3 bước
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Không cần biết thiết kế. Làm theo ba bước dưới đây là bạn đã có một tấm thiệp để gửi cho khách.
          </p>

          <ol className="mt-7 divide-y divide-line border-y border-line">
            {STEPS.map((s) => (
              <li key={s.no} className="flex gap-4 py-4">
                <span aria-hidden className="shrink-0 font-mono text-sm font-semibold text-[#27548A]">
                  {s.no}
                </span>
                <div>
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-sm text-muted">
            Chưa biết bắt đầu từ đâu? Xem hướng dẫn chi tiết để nắm rõ cách làm, rồi chọn mẫu bạn thích.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/templates" onClick={close} className="inline-flex h-12 flex-1 items-center justify-center bg-[#27548A] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1b3d66]">
              Bắt đầu tạo thiệp
            </Link>
            <Link href="/guide" onClick={close} className="inline-flex h-12 items-center justify-center border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-[#27548A] hover:text-[#27548A]">
              Xem hướng dẫn
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
