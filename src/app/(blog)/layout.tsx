import type { ReactNode } from "react";
import { Suspense } from "react";
import { getBlogCategories, getPageCopy } from "@/lib/catalog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { WelcomePopup } from "@/components/onboarding/WelcomePopup";

/** Layout riêng của blog: không dùng header/footer của site chính. */
export default async function BlogLayout({ children }: { children: ReactNode }) {
  const [categories, copy] = await Promise.all([getBlogCategories(), getPageCopy()]);
  return (
    <div className="tone-blue flex min-h-screen flex-col bg-[#FEFDFD] text-ink">
      <Suspense fallback={null}>
        <BlogHeader categories={categories} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <BlogFooter categories={categories} keywordGroups={copy.blog.keywordGroups} tagline={copy.blog.footerTagline} />
      <WelcomePopup />
    </div>
  );
}
