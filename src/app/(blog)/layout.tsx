import type { ReactNode } from "react";
import { Suspense } from "react";
import { getBlogCategories } from "@/lib/catalog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { SideAdsShell } from "@/components/ads/SideAdsShell";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";

/** Layout riêng của blog: không dùng header/footer của site chính. */
export default async function BlogLayout({ children }: { children: ReactNode }) {
  const categories = await getBlogCategories();
  return (
    <div className="tone-blue flex min-h-screen flex-col overflow-x-clip bg-[#FEFDFD] text-ink">
      <Suspense fallback={null}>
        <BlogHeader categories={categories} />
      </Suspense>
      <SideAdsShell>
        <main className="flex-1">{children}</main>
      </SideAdsShell>
      <BlogFooter categories={categories} />
      <WelcomePopup />
    </div>
  );
}
