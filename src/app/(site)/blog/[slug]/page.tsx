import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard, { PostCover, PostMeta } from "@/components/blog/PostCard";
import { POSTS, getCategory, getPost, getRelated, slugify, type Block } from "@/lib/blog";
import { Container } from "@/components/ui/Primitives";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | iCards`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article", publishedTime: post.date },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const cat = getCategory(post.category);
  const toc = post.content.filter((b): b is Extract<Block, { t: "h2" }> => b.t === "h2");
  const related = getRelated(post);

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <Container className="py-10 lg:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link href="/blog" className="hover:text-[#27548A] transition-colors">Blog</Link>
          {cat && (
            <>
              {" / "}
              <Link href={`/blog?category=${cat.slug}`} className="hover:text-[#27548A] font-medium transition-colors">{cat.label}</Link>
            </>
          )}
        </nav>

        <header className="mt-6 max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-slate-600">{post.excerpt}</p>
          <div className="mt-8 flex items-center gap-4">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold shadow-sm"
              style={{ backgroundColor: post.tone.bg, color: post.tone.ink }}
              aria-hidden="true"
            >
              {post.author.charAt(0)}
            </span>
            <div className="text-sm">
              <p className="font-medium text-slate-900 text-base">{post.author}</p>
              <PostMeta post={post} />
            </div>
          </div>
        </header>

        <PostCover post={post} className="mt-10 aspect-[21/9] rounded-3xl w-full" />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_280px]">
          <article className="max-w-[70ch] text-[17px] leading-8 text-slate-700">
            {post.content.map((b, i) => renderBlock(b, i, post.tone.ink))}
          </article>

          {toc.length > 1 && (
            <aside className="hidden lg:block">
              <nav aria-label="Mục lục" className="sticky top-28 border-l-2 border-[#E8EEF6] pl-6">
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Trong bài này</p>
                <ul className="mt-4 space-y-3 text-[15px]">
                  {toc.map((h) => (
                    <li key={h.text}>
                      <a href={`#${slugify(h.text)}`} className="text-slate-600 hover:text-[#27548A] transition-colors">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>

        <section className="mt-20 flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#27548A] p-8 md:p-12 text-white sm:flex-row sm:items-center shadow-xl shadow-[#27548A]/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Tạo thiệp mời của bạn ngay hôm nay</h2>
            <p className="mt-3 max-w-xl text-white/90 text-lg">
              Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.
            </p>
          </div>
          <Link
            href="/templates"
            className="shrink-0 rounded-full bg-white px-8 py-4 font-semibold text-[#27548A] transition-colors hover:bg-[#E8EEF6]"
          >
            Xem mẫu thiệp
          </Link>
        </section>

        {related.length > 0 && (
          <section aria-label="Bài viết liên quan" className="mt-20 border-t border-line pt-12">
            <h2 className="text-2xl font-bold text-slate-900">Bài viết liên quan</h2>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}

function renderBlock(b: Block, i: number, ink: string) {
  switch (b.t) {
    case "h2":
      return (
        <h2 key={i} id={slugify(b.text)} className="mb-4 mt-12 scroll-mt-28 text-2xl md:text-3xl font-bold leading-snug text-slate-900">
          {b.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className="my-5">
          {b.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="my-5 list-disc space-y-3 pl-6 marker:text-[#27548A]">
          {b.items.map((it) => (
            <li key={it} className="pl-2">{it}</li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <aside
          key={i}
          className="my-10 rounded-2xl border-l-4 bg-[#E8EEF6] px-6 py-5 text-slate-800"
          style={{ borderColor: ink }}
        >
          <p className="font-bold flex items-center gap-2">
            <span style={{ color: ink }}>✦</span> Mẹo nhỏ
          </p>
          <p className="mt-2 text-[16px]">{b.text}</p>
        </aside>
      );
  }
}