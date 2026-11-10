import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lightbulb } from "lucide-react";
import PostCard, { AuthorAvatar, PostCover } from "@/components/blog/PostCard";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";
import TocNav from "@/components/blog/TocNav";
import { Reveal } from "@/components/home/Reveal";
import { Container } from "@/components/ui/Primitives";
import { flatKeywords, formatDate, getCategory, getRelated, slugify, type Block } from "@/lib/blog";
import { getBlogCategories, getPageCopy, getPost, getPosts } from "@/lib/catalog";
import { SideAdsShell } from "@/components/ads/SideAdsShell";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | iCards Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date, authors: [post.author] },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [categories, all, copy] = await Promise.all([getBlogCategories(), getPosts(), getPageCopy()]);
  const cat = getCategory(categories, post.category);
  const content = post.content ?? [];
  const toc = content
    .filter((b): b is Extract<Block, { t: "h2" }> => b.t === "h2")
    .map((h) => ({ id: slugify(h.text), text: h.text }));
  const related = getRelated(all, post);
  const firstP = content.findIndex((b) => b.t === "p");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "iCards" },
  };

  return (
    <SideAdsShell>
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ReadingProgress targetId="post-body" />

      {/* Đầu bài: căn giữa, tiêu đề lớn, thông tin tác giả */}
      <header className="border-b border-line bg-white">
        <Container className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-lacquer">
              <ArrowLeft className="size-4" aria-hidden />
              Tất cả bài viết
            </Link>

            {cat && (
              <div className="mt-8">
                <Link
                  href={`/blog?category=${cat.slug}`}
                  className="inline-flex items-center bg-lacquer-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-lacquer transition-colors hover:bg-lacquer hover:text-white"
                >
                  {cat.label}
                </Link>
              </div>
            )}

            <h1 className="mt-6 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{post.excerpt}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-muted">
              <span className="flex items-center gap-2.5">
                <AuthorAvatar post={post} size="size-9" />
                <span className="font-semibold text-ink">{post.author}</span>
              </span>
              <span aria-hidden className="size-1 rounded-full bg-line" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden className="size-1 rounded-full bg-line" />
              <span>{post.readMinutes} phút đọc</span>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10 lg:py-14">
        <Reveal>
          <PostCover post={post} className="mx-auto aspect-[16/9] w-full max-w-5xl rounded-[2px] sm:aspect-[21/9]" />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
          <div className="min-w-0">
            {/* Mục lục thu gọn trên điện thoại */}
            {toc.length > 1 && (
              <details className="group mb-10 border border-line bg-porcelain p-5 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.14em] text-muted marker:hidden">
                  Trong bài này
                  <span aria-hidden className="text-lg text-lacquer transition-transform group-open:rotate-45">+</span>
                </summary>
                <ol className="mt-4 space-y-2.5">
                  {toc.map((h, i) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="flex gap-3 text-[15px] hover:text-lacquer">
                        <span className="tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <article id="post-body" className="text-[17px] leading-8 text-ink/85">
              {content.map((b, i) => renderBlock(b, i, i === firstP, post.tone.ink))}
            </article>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
              <Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-lacquer hover:underline">
                <ArrowLeft className="size-4" aria-hidden /> Về trang blog
              </Link>
              <ShareButtons title={post.title} />
            </div>

            {/* Thẻ tác giả */}
            <section aria-label="Tác giả" className="mt-12 flex gap-5 border border-line bg-white p-6">
              <AuthorAvatar post={post} size="size-14" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Viết bởi</p>
                <p className="mt-1 text-lg font-bold">{post.author}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">Đội ngũ iCards chia sẻ kinh nghiệm làm thiệp và chuẩn bị ngày vui.</p>
              </div>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-10">
              {toc.length > 1 && <TocNav items={toc} />}

              <div className="bg-lacquer p-6 text-white">
                <p className="text-lg font-bold leading-snug">Thiệp cưới online chỉ trong vài phút</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">Chọn mẫu, chỉnh sửa và gửi link cho khách mời.</p>
                <Link href="/templates" className="mt-5 flex h-11 items-center justify-center gap-2 bg-white text-sm font-semibold text-lacquer transition-colors hover:bg-white/90">
                  Xem mẫu thiệp <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>

              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-lacquer">Từ khoá thường gặp</p>
                <ul className="divide-y divide-line border-y border-line">
                  {flatKeywords(copy.blog.keywordGroups).slice(0, 8).map((k) => (
                    <li key={k.keyword}>
                      <Link href={`/blog?q=${encodeURIComponent(k.keyword)}#blog-list`} className="flex items-center justify-between gap-2 py-2.5 text-sm text-ink transition-colors hover:text-lacquer">
                        <span>{k.keyword}</span>
                        <span aria-hidden className="text-muted">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-label="Bài viết liên quan" className="mt-24 border-t-2 border-ink pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Bài viết liên quan</h2>
              <Link href="/blog" className="inline-flex items-center gap-1.5 font-semibold text-lacquer hover:underline">
                Xem tất cả bài viết <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.07}>
                  <PostCard post={p} categories={categories} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </Container>

      <Container className="pb-20 lg:pb-28">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 bg-lacquer p-8 text-white sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Tạo thiệp mời của bạn ngay hôm nay</h2>
              <p className="mt-3 max-w-xl text-white/80">Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.</p>
            </div>
            <Link href="/templates" className="inline-flex h-12 shrink-0 items-center bg-white px-7 text-[15px] font-semibold text-lacquer transition-colors hover:bg-white/90">
              Xem mẫu thiệp
            </Link>
          </div>
        </Reveal>
      </Container>
    </div>
    </SideAdsShell>
  );
}

function renderBlock(b: Block, i: number, isLead: boolean, ink: string) {
  switch (b.t) {
    case "h2":
      return (
        <h2 key={i} id={slugify(b.text)} className="mb-5 mt-14 scroll-mt-28 text-2xl font-bold leading-snug tracking-tight text-ink first:mt-0 md:text-3xl">
          {b.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className={isLead ? "mb-8 text-xl leading-9 text-ink md:text-[22px]" : "my-5"}>
          {b.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="my-7 space-y-3.5">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3.5">
              <span
                aria-hidden
                className="mt-1 grid size-6 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${ink} 14%, transparent)`, color: ink }}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <aside
          key={i}
          className="my-10 flex gap-4 border p-6"
          style={{
            borderColor: `color-mix(in srgb, ${ink} 22%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${ink} 7%, white)`,
          }}
        >
          <span aria-hidden className="grid size-10 shrink-0 place-items-center bg-white" style={{ color: ink }}>
            <Lightbulb className="size-5" />
          </span>
          <div>
            <p className="font-semibold" style={{ color: ink }}>Mẹo nhỏ</p>
            <p className="mt-1.5 text-[16px] leading-7 text-ink/85">{b.text}</p>
          </div>
        </aside>
      );
  }
}
