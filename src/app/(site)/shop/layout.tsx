import type { ReactNode } from "react";
import { PageShell } from "@/components/shop/PageShell";
import { BannerGroupList } from "@/components/banners/BannerGroupView";
import { getBannerGroups } from "@/lib/catalog";
import { groupsFor } from "@/lib/banner-groups";

export default async function ShopLayout({ children }: { children: ReactNode }) {
  // Banner đầu trang do admin quản lý (trang "shop")
  const groups = groupsFor(await getBannerGroups(), "shop", "top");
  return (
    <PageShell>
      <div>
        <BannerGroupList groups={groups} heroFirst />
        {children}
      </div>
    </PageShell>
  );
}
