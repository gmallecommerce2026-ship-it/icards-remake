"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import PostCard, { AuthorAvatar, PostCover, PostMeta } from "@/components/blog/PostCard";
import { countByCategory, filterPosts, getCategory, searchPosts, type BlogCategory, type Post } from "@/lib/blog";
import { PageHero, Container, btn } from "@/components/ui/Primitives";
import { Reveal } from "@/components/home/Reveal";

const PAGE_SIZE = 6; // mỗi lần bấm "Xem thêm" (giống trang cửa hàng)

export default function BlogClient({ posts: allPosts, categories }: { posts: Post[]; categories: BlogCategory[] }) {
  const category = useSearchParams().get("category") ?? undefined;
  const active = getCategory(categories, category);
  const [query, setQuery] = useState("");

  const counts = countByCategory(allPosts);
  const inCategory = filterPosts(allPosts, active?.slug);
  const posts = searchPosts(inCategory, query);
  const searching = query.trim().length > 0;

  // Chỉ dựng bố cục "nổi bật" khi không tìm kiếm; khi tìm thì hiện lưới phẳng cho dễ quét
  const showFeatured = !searching && posts.length > 0;
  const featured = showFeatured ? posts[0] : undefined;
  const side = showFeatured && posts.length >= 4 ? posts.slice(1, 3) : [];
  const gridPosts = showFeatured ? posts.slice(1 + side.length) : posts;

  return (
    <div className="min-h-screen bg-porcelain">
      <PageHero
        eyebrow="Blog iCards"
        title="Cẩm nang thiệp mời & ngày cưới"
        description="Cách làm thiệp, cách viết lời mời và kinh nghiệm chuẩn bị cho ngày vui của bạn."
      >
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative max-w-xl">
          <label htmlFor="blog-search" className="sr-only">Tìm bài viết</label>
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài viết: lời mời, mẫu thiệp, ngân sách..."
            className="w-full rounded-sm border border-line bg-porcelain py-3.5 pl-12 pr-12 outline-none transition placeholder:text-muted/70 focus:border-lacquer focus:bg-white"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xoá từ khoá"
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-lacquer-soft hover:text-lacquer"
            >
              <X className="size-4" />
            </button>
          )}
        </form>
      </PageHero>

      <Container className="py-12 lg:py-16">
        <nav aria-label="Chuyên mục" className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterLink href="/blog" label="Tất cả" count={allPosts.length} current={!active} />
          {categories.map((c) => (
            <FilterLink
              key={c.slug}
              href={`/blog?category=${c.slug}`}
              label={c.label}
              count={counts[c.slug] ?? 0}
              current={active?.slug === c.slug}
            />
          ))}
        </nav>

        {posts.length === 0 ? (
          <Empty searching={searching} onClear={() => setQuery("")} />
        ) : (
          <>
            {featured && (
              <div className={`mb-12 grid gap-5 lg:mb-16 ${side.length ? "lg:grid-cols-3" : ""}`}>
                <Reveal className={side.length ? "lg:col-span-2" : ""}>
                  <article className="group h-full">
                    <Link
                      href={`/blog/${featured.slug}`}
                      className={`grid h-full gap-6 rounded-3xl border border-line bg-white p-4 transition duration-300 hover:border-lacquer/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lacquer ${side.length ? "" : "lg:grid-cols-2 lg:items-center lg:gap-10"}`}
                    >
                      <PostCover post={featured} className={`rounded-2xl ${side.length ? "aspect-[16/9]" : "aspect-[16/10]"}`} />
                      <div className="flex flex-col gap-4 px-2 pb-2 lg:px-6 lg:pb-6">
                        <span className="w-fit rounded-sm bg-lacquer px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">Nổi bật</span>
                        <PostMeta post={featured} categories={categories} />
                        <h2 className="text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-lacquer sm:text-3xl lg:text-4xl">
                          {featured.title}
                        </h2>
                        <p className="max-w-2xl leading-relaxed text-muted lg:text-lg">{featured.excerpt}</p>
                        <div className="mt-2 flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2.5 text-sm">
                            <AuthorAvatar post={featured} />
                            <span className="font-medium">{featured.author}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-lacquer">
                            Đọc bài viết
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                </Reveal>

                {side.length > 0 && (
                  <div className="flex flex-col gap-5">
                    {side.map((p, i) => (
                      <Reveal key={p.slug} delay={0.08 * (i + 1)} className="flex-1">
                        <PostCard post={p} categories={categories} compact />
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            )}

            {gridPosts.length > 0 && (
              <PostGrid
                // key đổi theo bộ lọc để "Xem thêm" quay về trang đầu
                key={`${active?.slug ?? ""}|${query.trim()}`}
                posts={gridPosts}
                categories={categories}
                heading={searching ? `${posts.length} kết quả cho “${query.trim()}”` : active ? active.label : "Tất cả bài viết"}
              />
            )}
          </>
        )}
      </Container>

      <section className="px-5 pb-20 lg:px-8 lg:pb-28">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-lacquer to-lacquer-dark px-8 py-14 text-center text-white sm:px-16">
            <div aria-hidden className="absolute -bottom-16 -right-16 size-64 rounded-full border border-white/15" />
            <div aria-hidden className="absolute -bottom-28 -right-28 size-96 rounded-full border border-white/10" />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Đọc xong rồi, bắt tay vào làm thiệp thôi.
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-white/80">
              Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.
            </p>
            <Link href="/templates" className="relative mt-8 inline-block rounded-sm bg-white px-8 py-4 font-semibold text-lacquer transition hover:scale-105">
              Xem mẫu thiệp
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function PostGrid({ posts, categories, heading }: { posts: Post[]; categories: BlogCategory[]; heading: string }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const rest = posts.length - shown;
  return (
    <section aria-label={heading}>
      <h2 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, shown).map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.07}>
            <PostCard post={p} categories={categories} />
          </Reveal>
        ))}
      </div>
      {rest > 0 && (
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE_SIZE)} className={btn("secondary", "lg")}>
            Xem thêm {Math.min(rest, PAGE_SIZE)} bài viết
          </button>
        </div>
      )}
    </section>
  );
}

function Empty({ searching, onClear }: { searching: boolean; onClear: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-10 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-lacquer-soft text-lacquer">
        <Search className="size-5" />
      </span>
      <h2 className="mt-5 text-xl font-semibold">{searching ? "Không tìm thấy bài viết phù hợp" : "Chuyên mục này chưa có bài viết"}</h2>
      <p className="mt-2 text-muted">{searching ? "Thử từ khoá khác hoặc xem toàn bộ bài viết." : "Bạn có thể xem các chuyên mục khác bên trên."}</p>
      <div className="mt-6 flex justify-center gap-3">
        {searching && <button type="button" onClick={onClear} className={btn("secondary")}>Xoá từ khoá</button>}
        <Link href="/blog" className={btn("primary")}>Xem tất cả bài viết</Link>
      </div>
    </div>
  );
}

function FilterLink({ href, label, count, current }: { href: string; label: string; count: number; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={
        "inline-flex shrink-0 items-center gap-2 rounded-sm border px-4 py-2.5 text-sm font-semibold transition-colors " +
        (current
          ? "border-lacquer bg-lacquer text-white"
          : "border-line bg-white text-ink hover:border-lacquer hover:text-lacquer")
      }
    >
      {label}
      <span className={"text-xs font-medium " + (current ? "text-white/75" : "text-muted")}>{count}</span>
    </Link>
  );
}
