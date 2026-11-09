import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BLOG_KEYWORD_GROUPS, type BlogCategory } from "@/lib/blog";

/** Footer riêng của blog: nền navy, chuyên mục, từ khoá và lối về trang chủ. */
export function BlogFooter({ categories }: { categories: BlogCategory[] }) {
  const keywords = BLOG_KEYWORD_GROUPS.flatMap((g) => g.items).slice(0, 8);

  return (
    <footer className="bg-[#0f2a47] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:px-8">
        <div>
          <p className="text-xl font-bold tracking-tight">iCards Blog</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Cẩm nang làm thiệp mời, viết lời mời và chuẩn bị cho ngày vui của bạn.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center gap-2 border border-white/30 px-5 text-sm font-semibold transition-colors hover:bg-white hover:text-[#0f2a47]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Về trang chủ iCards
          </Link>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Chuyên mục</p>
          <ul className="mt-5 space-y-3">
            <li>
              <Link href="/blog" className="text-sm text-white/85 transition-colors hover:text-white">Tất cả bài viết</Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/blog?category=${c.slug}`} className="text-sm text-white/85 transition-colors hover:text-white">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Từ khoá phổ biến</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li key={k.keyword}>
                <Link
                  href={`/blog?q=${encodeURIComponent(k.keyword)}#blog-list`}
                  className="inline-block border border-white/15 px-3 py-1.5 text-sm text-white/85 transition-colors hover:border-white/50 hover:text-white"
                >
                  {k.keyword}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-white/55 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} iCards. Bảo lưu mọi quyền.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li><Link href="/templates" className="transition-colors hover:text-white">Mẫu thiệp</Link></li>
            <li><Link href="/privacy" className="transition-colors hover:text-white">Chính sách bảo mật</Link></li>
            <li><Link href="/terms" className="transition-colors hover:text-white">Điều khoản sử dụng</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
