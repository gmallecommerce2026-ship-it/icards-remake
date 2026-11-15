"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

const btnCls =
  "inline-flex items-center gap-2 rounded-sm border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-lacquer hover:text-lacquer";

/** Sao chép liên kết + chia sẻ Facebook (và Web Share trên điện thoại). */
export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* trình duyệt chặn clipboard: bỏ qua */ }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { return; }
    }
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className={btnCls}>
        <Share2 className="size-4" /> Chia sẻ
      </button>
      <button type="button" onClick={copy} className={btnCls} aria-live="polite">
        {copied ? <Check className="size-4 text-lacquer" /> : <Link2 className="size-4" />}
        {copied ? "Đã sao chép" : "Sao chép liên kết"}
      </button>
    </div>
  );
}
