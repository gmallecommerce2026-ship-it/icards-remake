"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import PostCard, { AuthorAvatar, PostCover, PostMeta } from "@/components/blog/PostCard";
import { countByCategory, filterPosts, formatDate, getCategory, searchPosts, type BlogCategory, type BlogKeywordGroup, type Post } from "@/lib/blog";
import type { PageCopy } from "@/lib/page-copy";
import { Container, btn } from "@/components/ui/Primitives";
import { Reveal } from "@/components/home/Reveal";
import { SideAdsShell } from "@/components/ads/SideAdsShell";
import { useHeaderHeight } from "@/components/ui/useHeaderHeight";

const PAGE_SIZE = 6;

export default function BlogClient({ posts: allPosts, categories, copy }: { posts: Post[]; categories: BlogCategory[]; copy: PageCopy["blog"] }) {
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

  const showFeatured = !searching && posts.length > 0;
  const featured = showFeatured ? posts[0] : undefined;
  const side = showFeatured && posts.length >= 4 ? posts.slice(1, 3) : [];
  const gridPosts = showFeatured ? posts.slice(1 + side.length) : posts;

  const headerH = useHeaderHeight();
  const heroEl = (
    <>
      {/* Hero xanh thương hiệu với ô tìm kiếm */}
      <section
        className="relative flex overflow-hidden bg-lacquer text-white"
        style={{ minHeight: "480px", height: headerH ? `calc(100svh - ${headerH}px)` : "100svh" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <Container className="relative flex w-full flex-col justify-center py-16 lg:py-24">
          <p className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
            <span aria-hidden className="size-1.5 bg-gold" />
            {copy.eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            {copy.description}
          </p>

          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-10 flex max-w-xl">
            <label htmlFor="blog-search" className="sr-only">Tìm bài viết</label>
            <div className="relative min-w-0 flex-1">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="h-13 w-full rounded-l-[2px] bg-white py-3.5 pl-11 pr-10 text-[15px] text-ink outline-none placeholder:text-muted/80"
              />
              {searching && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Xoá từ khoá"
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-lacquer-soft hover:text-lacquer"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <button type="button" onClick={() => document.getElementById("blog-list")?.scrollIntoView({ behavior: "smooth" })} className="h-13 shrink-0 rounded-r-[2px] bg-[#0f2a47] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#081a2e]">
              Tìm
            </button>
          </form>

          <p className="mt-6 text-sm text-white/70">
            {allPosts.length} bài viết · {categories.length} chuyên mục
          </p>
        </Container>
      </section>
    </>
  );

  return (
    <SideAdsShell hero={heroEl}>
    <div>

      <Container className="relative">
        {/* Thanh chuyên mục nổi lên trên hero */}
        <nav
          id="blog-list"
          aria-label="Chuyên mục"
          className="-mt-7 mb-12 flex gap-2 overflow-x-auto border border-line bg-white p-3 shadow-lg shadow-[#27548A]/5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible"
        >
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
              <div className={`mb-14 grid gap-5 ${side.length ? "lg:grid-cols-3" : ""}`}>
                <Reveal className={side.length ? "lg:col-span-2" : ""}>
                  <article className="group h-full">
                    <Link
                      href={`/blog/${featured.slug}`}
                      className={`grid h-full gap-6 border border-line bg-white p-4 transition-colors duration-300 hover:border-lacquer/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lacquer ${side.length ? "" : "lg:grid-cols-2 lg:items-center lg:gap-10 lg:p-6"}`}
                    >
                      <PostCover post={featured} className={`rounded-[2px] ${side.length ? "aspect-[16/9]" : "aspect-[4/3]"}`} />
                      <div className="flex flex-col gap-4 px-2 pb-2 lg:px-4 lg:pb-4">
                        <span className="w-fit bg-lacquer px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">Nổi bật</span>
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
                key={`${active?.slug ?? ""}|${query.trim()}`}
                posts={gridPosts}
                categories={categories}
                heading={searching ? `${posts.length} kết quả cho “${query.trim()}”` : active ? active.label : "Tất cả bài viết"}
              />
            )}
          </>
        )}

        {/* Từ khoá + tin mới */}
        <section aria-labelledby="blog-keywords" className="mt-20 border-t-2 border-ink pt-10">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="blog-keywords" className="text-2xl font-bold tracking-tight">Từ khoá thường gặp</h2>
            <p className="text-sm text-muted">Bấm từ khoá để xem các bài viết liên quan</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="grid gap-10 md:grid-cols-3">
              {copy.keywordGroups.map((g: BlogKeywordGroup) => (
                <div key={g.title}>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-lacquer">{g.title}</h3>
                  <ul className="divide-y divide-line border-y border-line">
                    {g.items.map((k) => {
                      const count = searchPosts(allPosts, k.keyword).length;
                      return (
                        <li key={k.keyword}>
                          <button type="button" onClick={() => pickKeyword(k.keyword)} className="group block w-full py-3.5 text-left">
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
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-lacquer">Mới cập nhật</h3>
              <ol className="divide-y divide-line border-y border-line">
                {[...allPosts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((p, i) => (
                  <li key={p.slug} className="flex gap-4 py-3.5">
                    <span className="w-5 shrink-0 text-right text-sm font-bold tabular-nums text-lacquer">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted">
                        <time dateTime={p.date}>{formatDate(p.date)}</time>
                        {getCategory(categories, p.category) && <> · {getCategory(categories, p.category)?.label}</>}
                      </p>
                      <Link href={`/blog/${p.slug}`} className="mt-1 line-clamp-2 block text-sm font-medium leading-snug text-ink transition-colors hover:text-lacquer">
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

      {/* Lời kêu gọi cuối trang */}
      <Container className="py-20 lg:py-28">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 bg-lacquer p-8 text-white sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Đọc xong rồi, bắt tay vào làm thiệp thôi.</h2>
              <p className="mt-2 max-w-lg text-white/80">Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.</p>
            </div>
            <Link href="/templates" className="inline-flex h-12 shrink-0 items-center gap-2 bg-white px-7 text-[15px] font-semibold text-lacquer transition-colors hover:bg-white/90">
              Xem mẫu thiệp
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </Container>
    </div>
    </SideAdsShell>
  );
}

function PostGrid({ posts, categories, heading }: { posts: Post[]; categories: BlogCategory[]; heading: string }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const rest = posts.length - shown;
  return (
    <section aria-label={heading}>
      <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        "inline-flex h-10 shrink-0 items-center gap-2 border px-4 text-sm font-medium transition-colors " +
        (current ? "border-lacquer bg-lacquer text-white" : "border-transparent bg-porcelain text-ink hover:bg-lacquer-soft hover:text-lacquer")
      }
    >
      {label}
      <span className={"text-xs " + (current ? "text-white/75" : "text-muted")}>{count}</span>
    </Link>
  );
}
