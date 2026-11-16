"use client";

import type { CSSProperties } from "react";
import { buildGoogleCalendarUrl, displayWhen, type CalendarInput } from "./calendarLink";

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 14h3v3H8z" fill="currentColor" />
    </svg>
  );
}

/**
 * Thẻ "Nhắc lịch" trên trang khách. Tách hẳn khỏi phần nội dung thiệp và phần cài đặt sự kiện:
 * có khung riêng, chữ lớn, nút to, và dùng biến màu --ev-* nên tự đổi theo giao diện của từng thiệp.
 */
export function GoogleCalendarCard({
  input,
  labelStyle,
  buttonStyle,
}: {
  input: CalendarInput;
  labelStyle: CSSProperties;
  buttonStyle: CSSProperties;
}) {
  const href = buildGoogleCalendarUrl(input);
  if (!href) return null;
  const when = displayWhen(input);

  return (
    <section
      aria-labelledby="calendar-reminder-title"
      className="mx-auto max-w-xl px-5 pt-12 text-center"
      style={{ fontFamily: "var(--ev-sans), system-ui, sans-serif" }}
    >
      <div
        className="px-5 py-7 sm:px-8"
        style={{
          border: "1px solid color-mix(in srgb, var(--ev-ink) 18%, transparent)",
          background: "color-mix(in srgb, var(--ev-accent) 6%, transparent)",
        }}
      >
        <h2 id="calendar-reminder-title" style={labelStyle}>Nhắc lịch</h2>

        <p className="mt-3 leading-snug" style={{ fontFamily: "var(--ev-serif), serif", fontSize: "clamp(1.2rem,3.6vw,1.45rem)" }}>
          Đừng quên ngày {when || "diễn ra sự kiện"}
        </p>

        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed opacity-80">
          Bấm nút bên dưới để thêm sự kiện vào Google Lịch. Ngày, giờ và địa điểm đã được điền sẵn, bạn chỉ cần bấm Lưu.
        </p>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-3 px-6 py-3 text-base font-semibold transition-opacity hover:opacity-90 sm:w-auto"
          style={{ ...buttonStyle, letterSpacing: "normal", textTransform: "none", fontWeight: 600 }}
        >
          <CalendarIcon />
          <span>Thêm vào Google Lịch</span>
        </a>

        <p className="mt-4 text-sm leading-relaxed opacity-65">
          Google Lịch sẽ mở ở tab mới. Nếu được hỏi, hãy đăng nhập tài khoản Google của bạn. Lời nhắc trước giờ diễn ra theo cài đặt Google Lịch của bạn.
        </p>
      </div>
    </section>
  );
}
