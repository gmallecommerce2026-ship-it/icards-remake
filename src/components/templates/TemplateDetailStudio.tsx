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

function ShareRow({ template, url }: { template: InvitationTemplate; url: string }) {
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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-xs font-medium text-muted">Chia sẻ</span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {items.map((item) => {
          const isCopied = copied && item.action === "copy";
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => run(item)}
                aria-label={item.label}
                title={item.label}
                className="grid size-9 place-items-center rounded-sm text-white transition-opacity hover:opacity-85"
                style={{ background: item.color }}
              >
                {isCopied ? <Check className="size-4" /> : item.icon ?? <span className="text-[13px] font-bold leading-none">{item.mark}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {copied && <span className="text-xs font-medium text-[#27548A]">Đã chép link</span>}
    </div>
  );
}

function Details({ template, categoryLabel, url }: { template: InvitationTemplate; categoryLabel: string; url: string }) {
  const free = template.price === 0;
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#27548A]">{categoryLabel}</p>
        <h1 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight lg:text-[28px]">{template.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted lg:line-clamp-2">{template.tagline}</p>
      </header>

      <div className="rounded-sm border border-line bg-white p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xl font-semibold text-[#27548A]">{free ? "Miễn phí" : formatPrice(template.price)}</span>
          <span className="text-xs text-muted">{free ? "dùng ngay" : "trả khi xuất bản"}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`${CREATE_EVENT_HREF}?template=${template.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-sm bg-[#27548A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1F4573]"
          >
            Dùng mẫu này
          </Link>
          <Link
            href="/templates"
            className="inline-flex h-11 items-center justify-center rounded-sm border border-line bg-white px-4 text-sm font-medium transition-colors hover:bg-porcelain"
          >
            Xem mẫu khác
          </Link>
        </div>
      </div>

      <div className="border-b border-line pb-5">
        <ShareRow template={template} url={url} />
      </div>

      <dl className="grid grid-cols-3 divide-x divide-line rounded-sm border border-line bg-porcelain text-center">
        <div className="px-2 py-2.5">
          <dt className="text-xs text-muted">Số phần</dt>
          <dd className="mt-0.5 text-sm font-semibold">{template.features.length}</dd>
        </div>
        <div className="px-2 py-2.5">
          <dt className="text-xs text-muted">Đã dùng</dt>
          <dd className="mt-0.5 text-sm font-semibold">{new Intl.NumberFormat("vi-VN").format(template.popularity)}</dd>
        </div>
        <div className="px-2 py-2.5">
          <dt className="text-xs text-muted">Phát hành</dt>
          <dd className="mt-0.5 text-sm font-semibold">{new Date(template.createdAt).toLocaleDateString("vi-VN")}</dd>
        </div>
      </dl>

      <section aria-labelledby="features-title">
        <h2 id="features-title" className="text-sm font-semibold">Thiệp này có</h2>
        <ul className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-2 min-[480px]:grid-cols-2">
          {template.features.map((f) => (
            <li key={f} className="flex gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-[#27548A]" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {template.description && (
        <section aria-labelledby="about-title" className="border-t border-line pt-4">
          <h2 id="about-title" className="text-sm font-semibold">Về mẫu này</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted lg:line-clamp-3">{template.description}</p>
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-14">
      {/* Mobile: carousel -> thông tin. Desktop: carousel | thông tin, vừa một màn hình */}
      <div className="min-w-0">
        <p className="mb-3 text-center text-xs text-muted lg:text-sm">Lật qua các mặt của thiệp để xem chi tiết</p>
        <TemplateCarousel template={template} />
      </div>

      <div className="min-w-0">
        <Details template={template} categoryLabel={categoryLabel} url={url} />
      </div>
    </div>
  );
}
