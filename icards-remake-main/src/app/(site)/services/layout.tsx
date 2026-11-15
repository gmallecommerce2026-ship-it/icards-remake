import type { ReactNode } from "react";
import { BannerGroupList } from "@/components/banners/BannerGroupView";
import { PageShell } from "@/components/shop/PageShell";
import { getBannerGroups } from "@/lib/catalog";
import { groupsFor } from "@/lib/banner-groups";

export default async function ServicesLayout({ children }: { children: ReactNode }) {
  // Banner đầu trang do admin quản lý (trang "services")
  const groups = groupsFor(await getBannerGroups(), "services", "top");
  return (
    <PageShell>
      <div>
        <BannerGroupList groups={groups} heroFirst />
        {children}
      </div>
    </PageShell>
  );
}
