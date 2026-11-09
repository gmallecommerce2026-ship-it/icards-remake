// src/components/blog/PostCard.tsx
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { formatDate, getCategory, type BlogCategory, type Post } from "@/lib/blog";

/**
 * Ảnh bìa vẽ bằng CSS từ `tone` của bài viết (cùng cách làm với `thumb` + `tone` trong shop.ts).
 * Cần đặt trong phần tử có class `group` để hiệu ứng hover hoạt động.
 */
export function PostCover({ post, className = "" }: { post: Post; className?: string }) {
  const { bg, ink } = post.tone;
  const soft = (pct: number) => `color-mix(in srgb, ${ink} ${pct}%, transparent)`;
  return (
    <div
      className={`relative isolate flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundColor: bg,
        backgroundImage: `radial-gradient(circle at 18% 12%, rgba(255,255,255,.75), transparent 55%), radial-gradient(${soft(14)} 1px, transparent 1px)`,
        backgroundSize: "auto, 18px 18px",
      }}
      aria-hidden="true"
    >
      {/* vòng tròn trang trí, cùng ngôn ngữ với khối bento ở trang chủ */}
      <div className="absolute -bottom-[28%] -right-[10%] -z-10 aspect-square w-[58%] rounded-full border transition-transform duration-700 group-hover:scale-110" style={{ borderColor: soft(22) }} />
      <div className="absolute -bottom-[44%] -right-[26%] -z-10 aspect-square w-[78%] rounded-full border transition-transform duration-700 group-hover:scale-110" style={{ borderColor: soft(12) }} />

      {/* tấm thiệp phía sau */}
      <div
        className="absolute h-[56%] aspect-[3/4] translate-x-[26%] rotate-6 rounded-[4px] bg-white/60 transition-transform duration-500 group-hover:translate-x-[34%] group-hover:rotate-[9deg]"
        style={{ boxShadow: `0 10px 24px -12px ${soft(35)}` }}
      />

      {/* tấm thiệp chính */}
      <div
        className="relative h-[64%] aspect-[3/4] -rotate-3 rounded-[4px] bg-white transition duration-500 group-hover:-translate-y-1 group-hover:rotate-0"
        style={{ boxShadow: `0 18px 34px -14px ${soft(45)}` }}
      >
        <div className="absolute inset-x-[14%] top-[14%] h-[3px] rounded-full opacity-90" style={{ backgroundColor: ink }} />
        <div className="absolute inset-x-[30%] top-[23%] h-[3px] rounded-full opacity-50" style={{ backgroundColor: ink }} />
        <div className="absolute left-1/2 top-[40%] grid aspect-square h-[26%] -translate-x-1/2 place-items-center rounded-full" style={{ backgroundColor: soft(14), color: ink }}>
          <Heart className="size-[48%] fill-current" strokeWidth={0} />
        </div>
        <div className="absolute inset-x-[22%] bottom-[18%] h-[3px] rounded-full opacity-50" style={{ backgroundColor: ink }} />
        <div className="absolute inset-x-[34%] bottom-[10%] h-[3px] rounded-full opacity-30" style={{ backgroundColor: ink }} />
      </div>
    </div>
  );
}

/** Chuyên mục · ngày đăng · thời gian đọc */
export function PostMeta({ post, categories = [], className = "" }: { post: Post; categories?: BlogCategory[]; className?: string }) {
  const cat = getCategory(categories, post.category);
  return (
    <p className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted ${className}`}>
      {cat && (
        <>
          <span className="font-semibold" style={{ color: post.tone.ink }}>{cat.label}</span>
          <span aria-hidden className="size-1 rounded-full bg-line" />
        </>
      )}
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden className="size-1 rounded-full bg-line" />
      <span>{post.readMinutes} phút đọc</span>
    </p>
  );
}

/** Chữ cái đầu của tác giả trong vòng tròn, lấy màu từ tone bài viết */
export function AuthorAvatar({ post, size = "size-9" }: { post: Post; size?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full text-sm font-semibold ${size}`}
      style={{ backgroundColor: post.tone.bg, color: post.tone.ink }}
    >
      {post.author.charAt(0)}
    </span>
  );
}

/** `compact`: bỏ đoạn tóm tắt và chân thẻ, dùng cho cột "Mới đăng" cạnh bài nổi bật. */
export default function PostCard({ post, categories = [], compact = false }: { post: Post; categories?: BlogCategory[]; compact?: boolean }) {
  return (
    <article className="group h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col rounded-3xl border border-line bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-lacquer/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lacquer"
      >
        <PostCover post={post} className={`rounded-2xl ${compact ? "aspect-[16/9]" : "aspect-[16/10]"}`} />
        <div className={`flex flex-1 flex-col px-3 pb-3 ${compact ? "pt-4" : "pt-5"}`}>
          <PostMeta post={post} categories={categories} />
          <h3 className={`mt-3 font-semibold leading-snug tracking-tight transition-colors group-hover:text-lacquer ${compact ? "text-lg" : "text-xl"}`}>
            {post.title}
          </h3>
          {!compact && <p className="mt-2 line-clamp-2 leading-relaxed text-muted">{post.excerpt}</p>}
          {!compact && (
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <span className="flex min-w-0 items-center gap-2.5 text-sm">
              <AuthorAvatar post={post} size="size-8" />
              <span className="truncate font-medium">{post.author}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-lacquer">
              Đọc tiếp
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
          )}
        </div>
      </Link>
    </article>
  );
}
