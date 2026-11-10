"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdSkyscraper } from "./AdSkyscraper";
import { SIDE_ADS } from "@/lib/side-ads";

/** Trang không đặt banner: đăng nhập/đăng ký, khôi phục mật khẩu, văn bản pháp lý. */
const NO_ADS = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/privacy", "/terms"];

/**
 * Khung bọc phần nội dung chính: banner dọc 160×600 dính hai bên (chỉ hiện từ 1440px trở lên).
 * Khoảng cách banner ↔ nội dung là một hằng số (gap-4), mọi trang cùng bề rộng tối đa 1520px
 * và cùng padding ngang 20px nên khoảng cách này giống hệt nhau ở tất cả các trang.
 */
export function SideAdsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const hidden = NO_ADS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (hidden) return <>{children}</>;

  return (
    <div className="mx-auto flex w-full flex-1 max-w-[calc(1520px+2*(160px+1rem))] justify-center gap-4">
      <div className="hidden w-[160px] shrink-0 min-[1440px]:block">
        <div className="sticky top-28 pt-6">
          <AdSkyscraper ad={SIDE_ADS.left} />
        </div>
      </div>

      <div className="min-w-0 flex-1">{children}</div>

      <div className="hidden w-[160px] shrink-0 min-[1440px]:block">
        <div className="sticky top-28 pt-6">
          <AdSkyscraper ad={SIDE_ADS.right} />
        </div>
      </div>
    </div>
  );
}
