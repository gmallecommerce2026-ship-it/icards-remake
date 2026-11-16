"use client";

import { useEffect } from "react";
import { EVENT_FONT_VARS, EventDetailsEditor, type EventDetailsEditorProps } from "./EventDetailsEditor";

/**
 * Màn "Cài đặt sự kiện" toàn màn hình, mở ngay khi bấm "Tiếp theo" ở trình thiết kế (không còn animation chen giữa).
 * Animation gói thiệp chạy SAU khi bấm Lưu / Thêm khách mời (xem EnvelopeSealAnimation).
 */
export function EventSetupScreen(props: EventDetailsEditorProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-white ${EVENT_FONT_VARS}`}>
      <EventDetailsEditor {...props} />
    </div>
  );
}
