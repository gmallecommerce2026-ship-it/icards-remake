"use client";

import type { ReactNode } from "react";
import { AdSkyscraper } from "./AdSkyscraper";
import { SIDE_ADS } from "@/lib/side-ads";

/**
 * Khung nội dung có banner dọc 160×600 hai bên (chỉ hiện từ 1440px trở lên).
 *
 * `hero` (tuỳ chọn) được render TRƯỚC khung, toàn chiều rộng, nên banner dọc
 * bắt đầu ngay dưới đáy hero chứ không nằm chồng lên hero.
 */
export function SideAdsShell({ children, hero }: { children: ReactNode; hero?: ReactNode }) {
  return (
    <>
      {hero}
      <div className="mx-auto flex w-full max-w-[calc(1520px+2*(160px+1rem))] justify-center gap-4">
        <div className="hidden w-[160px] shrink-0 min-[1440px]:block">
          <div className="sticky top-28">
            <AdSkyscraper ad={SIDE_ADS.left} />
          </div>
        </div>

        <div className="min-w-0 flex-1">{children}</div>

        <div className="hidden w-[160px] shrink-0 min-[1440px]:block">
          <div className="sticky top-28">
            <AdSkyscraper ad={SIDE_ADS.right} />
          </div>
        </div>
      </div>
    </>
  );
}
