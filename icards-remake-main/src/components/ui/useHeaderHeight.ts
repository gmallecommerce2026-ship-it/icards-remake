"use client";

import { useEffect, useState } from "react";

/**
 * Đo chiều cao header đang nằm trong luồng trang (header site chính hoặc header blog),
 * để banner toàn màn hình chỉ lấp phần còn lại bên dưới header. Trả 0 nếu chưa đo được.
 */
export function useHeaderHeight(selector = ".main-header-wrapper, header") {
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    const measure = () => setH(el ? el.offsetHeight : 0);
    measure();
    const ro = typeof ResizeObserver !== "undefined" && el ? new ResizeObserver(measure) : null;
    if (el) ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selector]);
  return h;
}
