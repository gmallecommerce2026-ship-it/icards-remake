"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import PostCard, { AuthorAvatar, PostCover, PostMeta } from "@/components/blog/PostCard";
import { BLOG_KEYWORD_GROUPS, countByCategory, filterPosts, formatDate, getCategory, searchPosts, type BlogCategory, type Post } from "@/lib/blog";
import { Container, btn } from "@/components/ui/Primitives";
import { Reveal } from "@/components/home/Reveal";

const PAGE_SIZE = 6; // mỗi lần bấm "Xem thêm" (giống trang cửa hàng)

export default function BlogClient({ posts: allPosts, categories }: { posts: Post[]; categories: BlogCategory[] }) {
  const sp = useSearchParams();
  const category = sp.get("category") ?? undefined;
  const active = getCategory(categories, category);
  const [query, setQuery] = useState(sp.get("q") ?? "");

  const counts = countByCategory(allPosts);
  const inCategory = filterPosts(allPosts, active?.slug);
  const posts = searchPosts(inCategory, query);
  const searching = query.trim().length > 0;

  const pickKeyword = (k: string) => {
    setQuery(k);
    document.getElementById("blog-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Chỉ dựng bố cục "nổi bật" khi không tìm kiếm; khi tìm thì hiện lưới phẳng cho dễ quét
  const showFeatured = !searching && posts.length > 0;
  const featured = showFeatured ? posts[0] : undefined;
  const side = showFeatured && posts.length >= 4 ? posts.slice(1, 3) : [];
  const gridPosts = showFeatured ? posts.slice(1 + side.length) : posts;

  return (
    <div className="tone-blue min-h-screen bg-[#FEFDFD] text-ink">
      {/* Đầu trang: breadcrumb về trang chủ, tiêu đề và ô tìm kiếm cùng hàng */}
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-14">
          <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href="/" className="transition-colors hover:text-lacquer">Trang chủ</Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-ink">Blog</span>
          </nav>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Cẩm nang thiệp mời & ngày cưới</h1>
              <p className="mt-3 text-base leading-relaxed text-muted">
                Cách làm thiệp, cách viết lời mời và kinh nghiệm chuẩn bị cho ngày vui của bạn.
              </p>
            </div>

            <form role="search" onSubmit={(e) => e.preventDefault()} className="relative w-full lg:w-96">
              <label htmlFor="blog-search" className="sr-only">Tìm bài viết</label>
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm bài viết: lời mời, mẫu thiệp, ngân sách..."
                className="h-11 w-full rounded-[2px] border border-[#ddd] bg-white pl-10 pr-10 text-sm outline-none transition placeholder:text-muted/80 focus:border-lacquer"
              />
              {searching && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Xoá từ khoá"
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-lacquer-soft hover:text-lacquer"
                >
                  <X className="size-4" />
                </button>
              )}
            </form>
          </div>
        </Container>
      </section>

      <Container className="py-10 lg:py-14">
        {/* Chuyên mục: chip vuông như trang mẫu thiệp */}
        <nav id="blog-list" aria-label="Chuyên mục" className="-mx-5 mb-10 flex gap-2.5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      className={`grid h-full gap-6 border border-line bg-white p-4 transition-colors duration-300 hover:border-lacquer/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lacquer ${side.length ? "" : "lg:grid-cols-2 lg:items-center lg:gap-10"}`}
                    >
                      <PostCover post={featured} className={`rounded-[2px] ${side.length ? "aspect-[16/9]" : "aspect-[16/10]"}`} />
                      <div className="flex flex-col gap-4 px-2 pb-2 lg:px-6 lg:pb-6">
                        <span className="w-fit text-xs font-semibold uppercase tracking-[0.14em] text-lacquer">Nổi bật</span>
                        <PostMeta post={featured} categories={categories} />
                        <h2 className="text-2xl font-bold leading-tight tracking-tight transition-colors group-hover:text-lacquer sm:text-3xl lg:text-4xl">
                          {featured.title}
                        </h2>
                        <p className="max-w-2xl leading-relaxed text-muted lg:text-lg">{featured.excerpt}</p>
                        <div className="mt-2 flex items-center justify-between gap-4 border-t border-line pt-5">
                          <span className="flex items-center gap-2.5 text-sm">
                            <AuthorAvatar post={featured} />
                            <span className="font-medium">{featured.author}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-lacquer">
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

        {/* Từ khoá + tin mới: bố cục dày đặc kiểu trang tin tức */}
        <section aria-labelledby="blog-keywords" className="mt-16 border-t-2 border-ink pt-8 lg:mt-20">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 id="blog-keywords" className="text-xl font-bold tracking-tight">Từ khoá thường gặp</h2>
            <p className="text-xs text-muted">Bấm từ khoá để xem các bài viết liên quan</p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            <div className="grid gap-8 md:grid-cols-3">
              {BLOG_KEYWORD_GROUPS.map((g) => (
                <div key={g.title}>
                  <h3 className="mb-2 border-l-4 border-lacquer pl-2.5 text-sm font-bold text-lacquer">{g.title}</h3>
                  <ul className="divide-y divide-line border-y border-line">
                    {g.items.map((k) => {
                      const count = searchPosts(allPosts, k.keyword).length;
                      return (
                        <li key={k.keyword}>
                          <button type="button" onClick={() => pickKeyword(k.keyword)} className="group block w-full py-3 text-left">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-ink transition-colors group-hover:text-lacquer">{k.keyword}</span>
                              <span className="shrink-0 text-xs tabular-nums text-muted">{count} bài</span>
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted">{k.blurb}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <aside aria-label="Mới cập nhật">
              <h3 className="mb-2 border-l-4 border-lacquer pl-2.5 text-sm font-bold text-lacquer">Mới cập nhật</h3>
              <ol className="divide-y divide-line border-y border-line">
                {[...allPosts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((p, i) => (
                  <li key={p.slug} className="flex gap-3 py-3">
                    <span className="w-5 shrink-0 text-right text-sm font-bold tabular-nums text-lacquer">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted">
                        <time dateTime={p.date}>{formatDate(p.date)}</time>
                        {getCategory(categories, p.category) && <> · {getCategory(categories, p.category)?.label}</>}
                      </p>
                      <Link href={`/blog/${p.slug}`} className="mt-0.5 line-clamp-2 block text-sm font-medium leading-snug text-ink transition-colors hover:text-lacquer">
                        {p.title}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>
      </Container>

      {/* Lời kêu gọi cuối trang: cùng kiểu khối nhạt với các trang khác, không có hoạ tiết riêng */}
      <Container className="pb-20 lg:pb-28">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 bg-lacquer-soft p-8 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Đọc xong rồi, bắt tay vào làm thiệp thôi.</h2>
              <p className="mt-2 max-w-lg text-muted">Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.</p>
            </div>
            <Link href="/templates" className={btn("primary", "lg", "shrink-0")}>
              Xem mẫu thiệp
            </Link>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

function PostGrid({ posts, categories, heading }: { posts: Post[]; categories: BlogCategory[]; heading: string }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const rest = posts.length - shown;
  return (
    <section aria-label={heading}>
      <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h2>
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
    <div className="mx-auto max-w-xl border border-line bg-white p-10 text-center">
      <span className="mx-auto grid size-12 place-items-center bg-lacquer-soft text-lacquer">
        <Search className="size-5" />
      </span>
      <h2 className="mt-5 text-xl font-bold">{searching ? "Không tìm thấy bài viết phù hợp" : "Chuyên mục này chưa có bài viết"}</h2>
      <p className="mt-2 text-muted">{searching ? "Thử từ khoá khác hoặc xem toàn bộ bài viết." : "Bạn có thể xem các chuyên mục khác bên trên."}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
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
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-[2px] border px-4 text-sm font-medium transition-colors " +
        (current
          ? "border-lacquer bg-lacquer text-white"
          : "border-[#ddd] bg-white text-ink hover:border-lacquer hover:text-lacquer")
      }
    >
      {label}
      <span className={"text-xs " + (current ? "text-white/75" : "text-muted")}>{count}</span>
    </Link>
  );
}
