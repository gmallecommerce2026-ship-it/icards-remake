import type { Metadata } from "next";
import Link from "next/link";
import PostCard, { PostCover, PostMeta } from "@/components/blog/PostCard";
import { BLOG_CATEGORIES, getCategory, getPosts } from "@/lib/blog";
import { PageHero, Container } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Blog | iCards",
  description:
    "Hướng dẫn tạo thiệp mời online, cách viết lời mời, kinh nghiệm tổ chức đám cưới và sự kiện.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = getCategory(category);
  const posts = getPosts(active?.slug);
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-porcelain">
      <PageHero 
        title="Blog thiệp mời"
        description="Cách làm thiệp, cách viết lời mời và kinh nghiệm chuẩn bị cho ngày vui của bạn."
      />

      <Container className="py-12 lg:py-16">
        <nav aria-label="Chuyên mục" className="mb-10 flex flex-wrap gap-2">
          <FilterLink href="/blog" label="Tất cả" current={!active} />
          {BLOG_CATEGORIES.map((c) => (
            <FilterLink
              key={c.slug}
              href={`/blog?category=${c.slug}`}
              label={c.label}
              current={active?.slug === c.slug}
            />
          ))}
        </nav>

        {!featured ? (
          <p className="mt-8 rounded-2xl bg-[#E8EEF6] p-8 text-center text-slate-700 max-w-3xl mx-auto">
            Chuyên mục này chưa có bài viết.{" "}
            <Link href="/blog" className="font-semibold text-[#27548A] underline">
              Xem tất cả bài viết
            </Link>
          </p>
        ) : (
          <>
            <article className="group mb-14">
              <Link
                href={`/blog/${featured.slug}`}
                className="grid items-center gap-6 rounded-3xl lg:grid-cols-2 lg:gap-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A] bg-white border border-line p-4 transition hover:shadow-lg"
              >
                <PostCover post={featured} className="aspect-[16/10] rounded-2xl" />
                <div className="space-y-4 p-4 lg:p-8">
                  <PostMeta post={featured} />
                  <h2 className="text-2xl font-bold leading-tight text-slate-900 group-hover:text-[#27548A] sm:text-3xl lg:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="text-base leading-relaxed text-slate-600">{featured.excerpt}</p>
                  <span className="inline-block pt-2 font-semibold text-[#27548A]">Đọc bài viết &rarr;</span>
                </div>
              </Link>
            </article>

            {rest.length > 0 && (
              <section aria-label="Bài viết khác" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </section>
            )}
          </>
        )}
      </Container>
    </main>
  );
}

function FilterLink({ href, label, current }: { href: string; label: string; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={
        "rounded-full px-5 py-2.5 text-sm font-medium transition-colors " +
        (current
          ? "bg-[#27548A] text-white"
          : "bg-white border border-line text-[#27548A] hover:border-[#27548A]")
      }
    >
      {label}
    </Link>
  );
}