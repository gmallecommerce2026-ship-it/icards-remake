import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Lightbulb } from "lucide-react";
import PostCard, { AuthorAvatar, PostCover, PostMeta } from "@/components/blog/PostCard";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButtons from "@/components/blog/ShareButtons";
import TocNav from "@/components/blog/TocNav";
import { Reveal } from "@/components/home/Reveal";
import { Container, btn } from "@/components/ui/Primitives";
import { BLOG_KEYWORD_GROUPS, getCategory, getRelated, slugify, type Block } from "@/lib/blog";
import { getBlogCategories, getPost, getPosts } from "@/lib/catalog";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | iCards`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date, authors: [post.author] },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [categories, all] = await Promise.all([getBlogCategories(), getPosts()]);
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
    <div className="tone-blue min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ReadingProgress targetId="post-body" />

      {/* Đầu bài */}
      <header className="border-b border-line bg-white">
        <Container className="py-10 lg:py-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href="/" className="transition-colors hover:text-lacquer">Trang chủ</Link>
            <span aria-hidden>/</span>
            <Link href="/blog" className="transition-colors hover:text-lacquer">Blog</Link>
            {cat && (
              <>
                <span aria-hidden>/</span>
                <Link href={`/blog?category=${cat.slug}`} className="font-medium transition-colors hover:text-lacquer">{cat.label}</Link>
              </>
            )}
          </nav>

          <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">{post.excerpt}</p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-line pt-6">
            <div className="flex items-center gap-3.5">
              <AuthorAvatar post={post} size="size-12" />
              <div>
                <p className="font-semibold">{post.author}</p>
                <PostMeta post={post} categories={categories} />
              </div>
            </div>
            <ShareButtons title={post.title} />
          </div>
        </Container>
      </header>

      <Container className="py-10 lg:py-14">
        <Reveal>
          <PostCover post={post} className="aspect-[16/9] w-full rounded-[2px] sm:aspect-[21/9]" />
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <div>
            {/* Mục lục thu gọn trên điện thoại */}
            {toc.length > 1 && (
              <details className="group mb-8 border border-line bg-porcelain p-5 lg:hidden">
                <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.14em] text-muted marker:hidden">
                  Trong bài này
                  <span aria-hidden className="float-right text-lacquer transition-transform group-open:rotate-45">+</span>
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

            <article id="post-body" className="max-w-[68ch] text-[17px] leading-8 text-ink/85">
              {content.map((b, i) => renderBlock(b, i, i === firstP, post.tone.ink))}
            </article>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
              <Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-lacquer hover:underline">
                <ArrowLeft className="size-4" /> Về trang blog
              </Link>
              <ShareButtons title={post.title} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {toc.length > 1 && <TocNav items={toc} />}
              <div className="rounded-none bg-lacquer-soft p-6">
                <p className="text-lg font-semibold leading-snug">Thiệp cưới online chỉ trong vài phút</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">Chọn mẫu, chỉnh sửa và gửi link cho khách mời.</p>
                <Link href="/templates" className={btn("primary", "md", "mt-5 w-full")}>Xem mẫu thiệp</Link>
              </div>
              <div>
                <p className="mb-2 border-l-4 border-lacquer pl-2.5 text-sm font-bold text-lacquer">Từ khoá thường gặp</p>
                <ul className="divide-y divide-line border-y border-line">
                  {BLOG_KEYWORD_GROUPS.flatMap((g) => g.items).slice(0, 10).map((k) => (
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

        <Reveal>
          <section className="mt-20 flex flex-col items-start justify-between gap-6 bg-lacquer-soft p-8 sm:flex-row sm:items-center md:p-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Tạo thiệp mời của bạn ngay hôm nay</h2>
              <p className="mt-3 max-w-xl text-lg text-muted">Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.</p>
            </div>
            <Link href="/templates" className={btn("primary", "lg", "shrink-0")}>
              Xem mẫu thiệp
            </Link>
          </section>
        </Reveal>

        {related.length > 0 && (
          <section aria-label="Bài viết liên quan" className="mt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-3xl font-bold tracking-tight">Bài viết liên quan</h2>
              <Link href="/blog" className="font-semibold text-lacquer hover:underline">Xem tất cả bài viết</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.07}>
                  <PostCard post={p} categories={categories} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}

function renderBlock(b: Block, i: number, isLead: boolean, ink: string) {
  switch (b.t) {
    case "h2":
      return (
        <h2 key={i} id={slugify(b.text)} className="mb-4 mt-14 scroll-mt-28 text-2xl font-semibold leading-snug tracking-tight text-ink first:mt-0 md:text-3xl">
          {b.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className={isLead ? "mb-6 text-xl leading-9 text-ink md:text-[22px]" : "my-5"}>
          {b.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="my-6 space-y-3.5">
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
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center bg-white"
            style={{ color: ink }}
          >
            <Lightbulb className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-ink" style={{ color: ink }}>Mẹo nhỏ</p>
            <p className="mt-1.5 text-[16px] leading-7 text-ink/85">{b.text}</p>
          </div>
        </aside>
      );
  }
}
