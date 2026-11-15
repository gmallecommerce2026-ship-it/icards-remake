"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageTitle } from "@/components/admin/ui";

// Các trình quản lý dùng state/API phía trình duyệt (banner còn dùng dnd-kit) nên tải động; chỉ tải tab đang mở.
const loading = () => <p className="text-sm text-[#5B6B7F]">Đang tải…</p>;
const AnnouncementAdmin = dynamic(() => import("@/components/admin/appearance/AnnouncementAdmin"), { ssr: false, loading });
const OccasionsAdmin = dynamic(() => import("@/components/admin/appearance/HomeOccasionsAdmin"), { ssr: false, loading });
const TemplateHeroAdmin = dynamic(() => import("@/components/admin/content/TemplateHeroAdmin"), { ssr: false, loading });
const BannerAdmin = dynamic(() => import("@/components/admin/banners/BannerAdmin"), { ssr: false, loading });
const MenuAdmin = dynamic(() => import("@/components/admin/content/MenuAdmin"), { ssr: false, loading });

const TABS = [
  { id: "announcement", label: "Thanh thông báo", Panel: AnnouncementAdmin },
  { id: "occasions", label: "Dịp lan tỏa niềm vui", Panel: OccasionsAdmin },
  { id: "heroes", label: "Hero danh mục 3D", Panel: TemplateHeroAdmin },
  { id: "banners", label: "Banner", Panel: BannerAdmin },
  { id: "menu", label: "Menu", Panel: MenuAdmin },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AppearanceTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get("tab");
  const active: TabId = TABS.some((t) => t.id === raw) ? (raw as TabId) : "occasions";
  const Panel = TABS.find((t) => t.id === active)!.Panel;

  return (
    <>
      <PageTitle title="Tuỳ chỉnh giao diện" description="Điều chỉnh những gì khách nhìn thấy ở trang chủ, trang mẫu thiệp và thanh điều hướng." />
      <div role="tablist" aria-label="Tuỳ chỉnh giao diện" className="mb-6 flex gap-1 overflow-x-auto border-b border-[#D9E1EC]">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              onClick={() => router.replace(`${pathname}?tab=${t.id}`, { scroll: false })}
              className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                on ? "border-[#27548A] text-[#27548A]" : "border-transparent text-[#5B6B7F] hover:text-[#0E1B2C]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`}>
        <Panel key={active} />
      </div>
    </>
  );
}
