import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { flatKeywords, type BlogCategory, type BlogKeywordGroup } from "@/lib/blog";
import { FooterFlap } from "@/components/home/FooterFlap";

/** Footer riêng của blog: nền trắng, chuyên mục, từ khoá và lối về trang chủ. */
export function BlogFooter({ categories, keywordGroups, tagline }: { categories: BlogCategory[]; keywordGroups: BlogKeywordGroup[]; tagline: string }) {
  const keywords = flatKeywords(keywordGroups).slice(0, 8);
  const link = "text-sm text-muted transition-colors hover:text-[#27548A]";

  return (
    <footer className="border-t border-line bg-white text-ink">
      <FooterFlap />

      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <p className="text-xl font-bold tracking-tight text-[#27548A]">iCards Blog</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {tagline}
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-md border border-[#27548A] px-5 text-sm font-semibold text-[#27548A] transition-colors hover:bg-[#27548A] hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Về trang chủ iCards
          </Link>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Chuyên mục</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/blog" className={link}>Tất cả bài viết</Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/blog?category=${c.slug}`} className={link}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Từ khoá phổ biến</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li key={k.keyword}>
                <Link
                  href={`/blog?q=${encodeURIComponent(k.keyword)}#blog-list`}
                  className="inline-block rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-[#27548A] hover:bg-[#E8EEF6] hover:text-[#27548A]"
                >
                  {k.keyword}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line bg-porcelain">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} iCards. Bảo lưu mọi quyền.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li><Link href="/templates" className="transition-colors hover:text-[#27548A]">Mẫu thiệp</Link></li>
            <li><Link href="/privacy" className="transition-colors hover:text-[#27548A]">Chính sách bảo mật</Link></li>
            <li><Link href="/terms" className="transition-colors hover:text-[#27548A]">Điều khoản sử dụng</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
