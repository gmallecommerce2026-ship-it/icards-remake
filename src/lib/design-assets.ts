"use client";

// Tài nguyên thiết kế bổ sung do admin quản lý (font, màu, hình nền). Dùng chung cho trình thiết kế.
// Chỉ BỔ SUNG vào danh sách có sẵn trong mã nguồn; không thay thế.
import { useEffect, useState } from "react";
import { templatesApi } from "@/lib/api";
import type { DesignAssetsData } from "@/lib/api/admin";

export type { DesignAssetsData, DesignFontItem, DesignBackdropItem } from "@/lib/api/admin";

const EMPTY: DesignAssetsData = { fonts: [], colors: [], backdrops: [] };

let cache: Promise<DesignAssetsData> | null = null;

/** Tải một lần cho mỗi lần mở trang. Lỗi mạng thì dùng danh sách rỗng, trình thiết kế vẫn chạy bình thường. */
export function loadDesignAssets(): Promise<DesignAssetsData> {
  if (!cache) {
    cache = templatesApi
      .getDesignAssetsPublic()
      .then((r) => {
        const d = r.data as Partial<DesignAssetsData>;
        return { fonts: d.fonts ?? [], colors: d.colors ?? [], backdrops: d.backdrops ?? [] };
      })
      .catch(() => {
        cache = null;
        return EMPTY;
      });
  }
  return cache;
}

const loadedFamilies = new Set<string>();

/** Nạp các phông Google được admin thêm (một thẻ link cho cả đợt). */
export function ensureGoogleFonts(fonts: { name: string }[]) {
  if (typeof document === "undefined") return;
  const families = [...new Set(fonts.map((f) => f.name))].filter((f) => !loadedFamilies.has(f));
  if (families.length === 0) return;
  families.forEach((f) => loadedFamilies.add(f));
  const query = families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`).join("&");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
  document.head.appendChild(link);
}

/** Hook: trả về tài nguyên bổ sung và tự nạp font Google tương ứng. */
export function useDesignAssets(): DesignAssetsData {
  const [data, setData] = useState<DesignAssetsData>(EMPTY);
  useEffect(() => {
    let alive = true;
    loadDesignAssets().then((d) => {
      if (!alive) return;
      ensureGoogleFonts(d.fonts);
      setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

/** Ghép danh sách có sẵn với mục bổ sung, bỏ trùng và giữ thứ tự. */
export function mergeUnique<T>(base: readonly T[], extra: readonly T[]): T[] {
  const out = [...base];
  for (const x of extra) if (!out.includes(x)) out.push(x);
  return out;
}

/** Chuyển một hình nền bổ sung thành giá trị CSS mà trình thiết kế dùng như các hình nền có sẵn. */
export function backdropCss(b: { type: string; value: string }): string {
  return b.type === "image" ? `url("${b.value}") center / cover no-repeat` : b.value;
}
