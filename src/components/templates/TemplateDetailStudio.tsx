"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import { CREATE_EVENT_HREF, formatPrice, type InvitationTemplate } from "@/lib/templates";
import { TemplateCarousel } from "./TemplateCarousel";

type ShareItem = {
  label: string;
  color: string;
  mark?: string;
  icon?: ReactNode;
  href?: string;
  action?: "copy" | "qr";
};

/** Chỉ giữ các nền tảng lớn và hai tính năng riêng: sao chép link và mã QR. */
function buildShareItems(url: string, text: string): ShareItem[] {
  const u = encodeURIComponent(url);
  const ut = encodeURIComponent(`${text} ${url}`);
  return [
    { label: "Facebook", mark: "f", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "Messenger", mark: "m", color: "#0084FF", href: `fb-messenger://share/?link=${u}` },
    { label: "Zalo", mark: "Z", color: "#0068FF", href: `https://zalo.me/share?u=${u}` },
    { label: "WhatsApp", mark: "W", color: "#25D366", href: `https://wa.me/?text=${ut}` },
    { label: "Sao chép link", color: "#14233F", icon: <Copy className="size-4" />, action: "copy" },
    { label: "Mã QR", color: "#14233F", icon: <QrCode className="size-4" />, action: "qr" },
  ];
}

function ShareRail({ template, url }: { template: InvitationTemplate; url: string }) {
  const [copied, setCopied] = useState(false);
  const items = buildShareItems(url, `Mẫu thiệp ${template.name} trên iCards`);

  async function run(item: ShareItem) {
    if (item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.action === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } catch { /* trình duyệt chặn clipboard */ }
    }
    if (item.action === "qr") {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <aside aria-label="Chia sẻ mẫu thiệp" className="lg:sticky lg:top-28">
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-5 lg:flex-col lg:items-center lg:gap-y-6">
        {items.map((item) => {
          const isCopied = copied && item.action === "copy";
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => run(item)}
                aria-label={item.label}
                className="group flex w-[72px] flex-col items-center gap-2 text-center"
              >
                <span
                  className="grid size-11 place-items-center rounded-full text-white transition-transform duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5"
                  style={{ background: item.color }}
                >
                  {isCopied ? <Check className="size-4" /> : item.icon ?? <span className="text-[13px] font-bold leading-none">{item.mark}</span>}
                </span>
                <span className="text-[11px] leading-tight text-muted group-hover:text-ink">{isCopied ? "Đã chép" : item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function Details({ template, categoryLabel }: { template: InvitationTemplate; categoryLabel: string }) {
  const free = template.price === 0;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lacquer">{categoryLabel}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">{template.name}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{template.tagline}</p>
      </div>

      <div className="rounded-xl border border-line bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-2xl font-semibold text-lacquer">{free ? "Miễn phí" : formatPrice(template.price)}</span>
          <span className="text-xs text-muted">{free ? "dùng ngay" : "trả khi xuất bản"}</span>
        </div>
        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            href={`${CREATE_EVENT_HREF}?template=${template.slug}`}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-lacquer px-6 text-base font-semibold text-white transition-colors hover:bg-lacquer-dark"
          >
            Dùng mẫu này
          </Link>
          <Link
            href="/templates"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-medium transition-colors hover:bg-porcelain"
          >
            Xem mẫu khác
          </Link>
        </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-porcelain text-center">
        <div className="p-3">
          <dt className="text-xs text-muted">Số phần</dt>
          <dd className="mt-1 font-semibold">{template.features.length}</dd>
        </div>
        <div className="p-3">
          <dt className="text-xs text-muted">Đã dùng</dt>
          <dd className="mt-1 font-semibold">{new Intl.NumberFormat("vi-VN").format(template.popularity)}</dd>
        </div>
        <div className="p-3">
          <dt className="text-xs text-muted">Phát hành</dt>
          <dd className="mt-1 text-sm font-semibold">{new Date(template.createdAt).toLocaleDateString("vi-VN")}</dd>
        </div>
      </dl>

      <section aria-labelledby="features-title">
        <h2 id="features-title" className="text-base font-semibold">Thiệp này có</h2>
        <ul className="mt-3 space-y-2.5">
          {template.features.map((f) => (
            <li key={f} className="flex gap-3 text-[15px]">
              <Check className="mt-0.5 size-4 shrink-0 text-lacquer" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {template.description && (
        <section aria-labelledby="about-title" className="border-t border-line pt-5">
          <h2 id="about-title" className="text-base font-semibold">Về mẫu này</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{template.description}</p>
        </section>
      )}
    </div>
  );
}

export function TemplateDetailStudio({ template, categoryLabel }: { template: InvitationTemplate; categoryLabel: string }) {
  const [url, setUrl] = useState(`https://icards.com.vn/templates/${template.slug}`);

  useEffect(() => {
    setUrl(window.location.href.split("?")[0].replace(/\/$/, ""));
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[104px_minmax(0,1fr)_340px] lg:gap-12">
      {/* Mobile: carousel -> chia sẻ -> chi tiết. Desktop: chia sẻ | carousel | chi tiết */}
      <div className="order-2 lg:order-1">
        <ShareRail template={template} url={url} />
      </div>

      <div className="order-1 min-w-0 lg:order-2">
        <p className="mb-4 text-center text-sm text-muted">Lật qua các mặt của thiệp để xem chi tiết</p>
        <TemplateCarousel template={template} />
      </div>

      <div className="order-3 lg:sticky lg:top-28 lg:self-start">
        <Details template={template} categoryLabel={categoryLabel} />
      </div>
    </div>
  );
}
