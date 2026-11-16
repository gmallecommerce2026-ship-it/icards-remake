"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, Link2, Mail, Printer, QrCode, Share2 } from "lucide-react";
import { CREATE_EVENT_HREF, formatPrice, type InvitationTemplate } from "@/lib/templates";
import { TemplatePreviewScreen, type PreviewDevice } from "./TemplatePreviewScreen";

type ShareItem = {
  label: string;
  color: string;
  mark?: string;
  icon?: ReactNode;
  href?: string;
  action?: "copy" | "native" | "qr" | "print";
};

function buildShareItems(url: string, text: string): ShareItem[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const ut = encodeURIComponent(`${text} ${url}`);
  return [
    { label: "Facebook", mark: "f", color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "Messenger", mark: "m", color: "#0084FF", href: `fb-messenger://share/?link=${u}` },
    { label: "Zalo", mark: "Z", color: "#0068FF", href: `https://zalo.me/share?u=${u}` },
    { label: "WhatsApp", mark: "W", color: "#25D366", href: `https://wa.me/?text=${ut}` },
    { label: "Telegram", mark: "T", color: "#26A5E4", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { label: "Viber", mark: "V", color: "#7360F2", href: `viber://forward?text=${ut}` },
    { label: "X", mark: "X", color: "#111111", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: "Threads", mark: "@", color: "#101010", href: `https://www.threads.net/intent/post?text=${ut}` },
    { label: "LinkedIn", mark: "in", color: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "Pinterest", mark: "P", color: "#E60023", href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}` },
    { label: "Reddit", mark: "R", color: "#FF4500", href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
    { label: "Email", color: "#27548A", icon: <Mail className="size-4" />, href: `mailto:?subject=${t}&body=${ut}` },
    { label: "SMS", color: "#27548A", icon: <Share2 className="size-4" />, href: `sms:?&body=${ut}` },
    { label: "Sao chép link", color: "#27548A", icon: <Link2 className="size-4" />, action: "copy" },
    { label: "Chia sẻ hệ thống", color: "#27548A", icon: <Share2 className="size-4" />, action: "native" },
    { label: "Mã QR", color: "#27548A", icon: <QrCode className="size-4" />, action: "qr" },
    { label: "In", color: "#27548A", icon: <Printer className="size-4" />, action: "print" },
  ];
}

function Badge({ item, copied }: { item: ShareItem; copied: boolean }) {
  if (copied) return <Check className="size-4" />;
  if (item.icon) return <>{item.icon}</>;
  return <span className="text-[13px] font-bold leading-none">{item.mark}</span>;
}

function ShareRail({ template, url }: { template: InvitationTemplate; url: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Mẫu thiệp ${template.name} trên iCards`;
  const items = buildShareItems(url, text);

  async function run(item: ShareItem) {
    if (item.href) {
      window.open(item.href, item.href.startsWith("http") ? "_blank" : "_self", "noopener,noreferrer");
      return;
    }
    if (item.action === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } catch { /* trình duyệt chặn clipboard */ }
    }
    if (item.action === "native" && navigator.share) {
      navigator.share({ title: `Mẫu thiệp ${template.name}`, text, url }).catch(() => {});
    }
    if (item.action === "qr") {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
    }
    if (item.action === "print") window.print();
  }

  return (
    <aside aria-label="Chia sẻ mẫu thiệp" className="lg:sticky lg:top-28">
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted lg:mb-4">Chia sẻ</p>
      <ul className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:gap-x-2 lg:gap-y-4 lg:overflow-visible lg:pb-0">
        {items.map((item) => (
          <li key={item.label} className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => run(item)}
              title={item.label}
              aria-label={item.label}
              className="group flex w-[60px] flex-col items-center gap-1.5 text-center"
            >
              <span
                className="grid size-11 place-items-center rounded-full text-white shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105 group-focus-visible:-translate-y-0.5"
                style={{ background: item.color }}
              >
                <Badge item={item} copied={copied && item.action === "copy"} />
              </span>
              <span className="w-full truncate text-[11px] leading-tight text-muted group-hover:text-ink">{item.label}</span>
            </button>
          </li>
        ))}
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
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [url, setUrl] = useState(`https://icards.com.vn/templates/${template.slug}`);

  useEffect(() => {
    setUrl(window.location.href.split("?")[0].replace(/\/$/, ""));
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[96px_minmax(0,1fr)_340px] lg:gap-10">
      <ShareRail template={template} url={url} />

      <section aria-label={`Xem thiệp mẫu ${template.name}`} className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Cuộn bên trong khung để xem hiệu ứng</p>
          <div role="tablist" aria-label="Chọn thiết bị xem trước" className="inline-flex rounded-xl border border-line bg-white p-1">
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                role="tab"
                aria-selected={device === d}
                onClick={() => setDevice(d)}
                className={`h-8 rounded-lg px-4 text-sm font-medium transition-colors ${
                  device === d ? "bg-lacquer text-white" : "text-muted hover:text-ink"
                }`}
              >
                {d === "desktop" ? "Máy tính" : "Điện thoại"}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-porcelain p-4 sm:p-8">
          <TemplatePreviewScreen template={template} device={device} />
        </div>
      </section>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <Details template={template} categoryLabel={categoryLabel} />
      </div>
    </div>
  );
}
