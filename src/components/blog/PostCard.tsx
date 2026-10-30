// src/components/blog/PostCard.tsx
import Link from "next/link";
import { formatDate, getCategory, type Post } from "@/lib/blog";

/** Ảnh bìa vẽ bằng CSS từ tone của bài viết (cùng cách làm với `thumb` + `tone` trong shop.ts). */
export function PostCover({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: post.tone.bg }}
      aria-hidden="true"
    >
      <div
        className="relative h-[62%] aspect-[3/4] -rotate-3 rounded-md bg-white shadow-[0_10px_30px_-12px_rgba(39,84,138,0.35)] transition-transform duration-300 group-hover:rotate-0"
        style={{ boxShadow: `0 14px 30px -14px ${post.tone.ink}66` }}
      >
        <div className="absolute inset-x-[14%] top-[16%] h-[3px] rounded-full opacity-90" style={{ backgroundColor: post.tone.ink }} />
        <div className="absolute inset-x-[30%] top-[26%] h-[3px] rounded-full opacity-50" style={{ backgroundColor: post.tone.ink }} />
        <div className="absolute left-1/2 top-[44%] h-[22%] aspect-square -translate-x-1/2 rounded-full border-2" style={{ borderColor: post.tone.ink }} />
        <div className="absolute inset-x-[22%] bottom-[16%] h-[3px] rounded-full opacity-50" style={{ backgroundColor: post.tone.ink }} />
        <div className="absolute inset-x-[34%] bottom-[9%] h-[3px] rounded-full opacity-30" style={{ backgroundColor: post.tone.ink }} />
      </div>
    </div>
  );
}

export function PostMeta({ post }: { post: Post }) {
  const cat = getCategory(post.category);
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
      {cat && (
        <span className="font-medium" style={{ color: post.tone.ink }}>
          {cat.label}
        </span>
      )}
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span>{post.readMinutes} phút đọc</span>
    </p>
  );
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A]"
      >
        <PostCover post={post} className="aspect-[16/10] rounded-2xl" />
        <div className="mt-4 space-y-2">
          <PostMeta post={post} />
          <h3 className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-[#27548A]">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-[15px] leading-relaxed text-slate-600">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}