"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, MessageCircle, Phone, QrCode, Link2, Share2, Eye, X, ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import { CREATE_EVENT_HREF, formatPrice, type InvitationTemplate } from "@/lib/templates";
import { TemplateCard } from "./TemplateCard";
import { TemplatePreviewScreen, type PreviewDevice } from "./TemplatePreviewScreen";
import { ShowcaseRail, ShowcaseStage, type ShowcaseKey } from "./TemplateShowcaseStage";
import "./TemplateDetailStudio.css";

/* ---------- Chia sẻ ---------- */

type ShareItem = {
  label: string;
  short: string;
  color: string;
  icon: ReactNode;
  href?: string;
  action?: "copy" | "qr";
};

/** Logo Facebook (chữ "f") vẽ bằng SVG để đúng nhận diện thương hiệu. */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden focusable="false">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

/** Chỉ giữ các nền tảng lớn và hai tính năng riêng: sao chép link và mã QR. */
function buildShareItems(url: string, text: string): ShareItem[] {
  const u = encodeURIComponent(url);
  const ut = encodeURIComponent(`${text} ${url}`);
  return [
    { label: "Facebook", short: "Facebook", color: "#1877F2", icon: <FacebookIcon />, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "Messenger", short: "Messenger", color: "#0084FF", icon: <MessageCircle className="size-5" />, href: `fb-messenger://share/?link=${u}` },
    // Zalo không có icon trong bộ lucide, dùng chữ "Zalo" làm logo
    { label: "Zalo", short: "Zalo", color: "#0068FF", icon: <span className="text-[12px] font-extrabold leading-none tracking-tight">Zalo</span>, href: `https://zalo.me/share?u=${u}` },
    { label: "WhatsApp", short: "WhatsApp", color: "#25D366", icon: <Phone className="size-5" />, href: `https://wa.me/?text=${ut}` },
    { label: "Sao chép link", short: "Sao chép", color: "#14233F", icon: <Link2 className="size-5" />, action: "copy" },
    { label: "Mã QR", short: "Mã QR", color: "#14233F", icon: <QrCode className="size-5" />, action: "qr" },
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
    <ul className="idp-share-wrap flex flex-wrap gap-x-3 gap-y-3">
      {items.map((item) => {
        const isCopied = copied && item.action === "copy";
        return (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => run(item)}
              aria-label={item.label}
              title={item.label}
              className="group flex w-[60px] flex-col items-center gap-1.5 text-center"
            >
              <span className="grid size-10 place-items-center rounded-sm text-white transition-opacity group-hover:opacity-85" style={{ background: item.color }}>
                {isCopied ? <Check className="size-5" /> : item.icon}
              </span>
              <span className="text-[11px] leading-tight text-[#5B6B7F] group-hover:text-[#0E1B2C]">{isCopied ? "Đã chép" : item.short}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Thông tin (cột phải) ---------- */

/** Mô tả thu gọn, có nút Xem thêm / Thu gọn */
function Description({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setOverflowing(el.scrollHeight > el.clientHeight + 4);
  }, [text]);
  return (
    <>
      <p
        ref={ref}
        className={`idp-desc whitespace-pre-line ${expanded ? "is-expanded" : ""} ${overflowing && !expanded ? "is-clamped" : ""}`}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button type="button" className="idp-more" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </>
  );
}

function Accordion({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`idp-acc ${open ? "is-open" : ""}`}>
      <h2>
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {title}
          <span className="idp-acc-chevron" aria-hidden="true" />
        </button>
      </h2>
      {open && <div className="idp-acc-body">{children}</div>}
    </section>
  );
}

const FEATURE_ICON_PATHS = [
  // palette (tùy chỉnh)
  <path key="p" d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.2 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" />,
  // website (trang thiệp online)
  <path key="w" d="M3 8.5h18M7 13h6M7 16h4" />,
  // phone (gửi riêng)
  <path key="ph" d="M7 2.5h10v19H7zM11 18.5h2" />,
  // tracking (xác nhận)
  <path key="t" d="M4 6.5 5.5 8 8 5.5M11 7h9M4 12.5 5.5 14 8 11.5M11 13h9" />,
  // guests (khách mời)
  <path key="g" d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.5M17.5 14.5A5 5 0 0 1 20.5 19" />,
  // gift (lời chúc, mừng)
  <path key="gi" d="M3.5 8h17v4h-17zM5 12v8h14v-8M12 8v12" />,
];

const FEATURES = [
  "Tùy chỉnh mọi thứ: chữ, ảnh, màu sắc, phông chữ và khối hình trên từng trang thiệp.",
  "Kèm trang thiệp online: album ảnh, video, nhạc nền, đếm ngược, lịch trình và bản đồ chỉ đường.",
  "Gửi bằng email hoặc đường link riêng cho từng khách (dán vào Zalo, Messenger).",
  "Khách xác nhận tham dự ngay trên thiệp; bạn theo dõi ai tham dự, ai chưa phản hồi.",
  "Quản lý khách mời theo nhóm, nhập và xuất danh sách bằng file Excel.",
  "Sổ lời chúc cho khách và hộp mừng bằng mã QR.",
];

function DetailPanel({
  template,
  categoryLabel,
  url,
  onPreview,
}: {
  template: InvitationTemplate;
  categoryLabel: string;
  url: string;
  onPreview: () => void;
}) {
  const free = template.price === 0;
  const pageCount = template.design?.pages ? Object.keys(template.design.pages).length : 0;
  const [shared, setShared] = useState(false);

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: template.name, text: `Mẫu thiệp ${template.name} trên iCards`, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch { /* trình duyệt chặn clipboard */ }
  }

  return (
    <aside className="idp-panel">
      <div className="idp-head">
        <div className="min-w-0">
          <p className="idp-eyebrow">{categoryLabel}</p>
          <h1 className="idp-title">{template.name}</h1>
        </div>
        <button type="button" className="idp-icon-btn" aria-label={shared ? "Đã sao chép liên kết" : "Chia sẻ mẫu thiệp"} title="Chia sẻ" onClick={share}>
          {shared ? <Check className="size-5" /> : <Share2 className="size-5" />}
        </button>
      </div>
      <p className="idp-tagline">{template.tagline}</p>

      <div className="idp-price">
        <span className="idp-price-value">{free ? "Miễn phí" : formatPrice(template.price)}</span>
        <span className="idp-price-note">{free ? "dùng ngay" : "trả khi xuất bản"}</span>
      </div>
      <Link href="/faq" className="idp-link">Câu hỏi thường gặp</Link>

      <div className="idp-box">
        <Link href={`${CREATE_EVENT_HREF}?template=${template.slug}`} className="idp-cta">
          Dùng mẫu này
        </Link>
        <button type="button" className="idp-secondary" onClick={onPreview}>
          <Eye className="size-5" aria-hidden />
          Xem trước
        </button>
      </div>
      <p className="idp-note">
        {free
          ? "Miễn phí chỉnh sửa. Chỉ cần đăng nhập khi lưu hoặc gửi thiệp."
          : "Chỉnh sửa và xem trước miễn phí. Thanh toán khi xuất bản thiệp."}
      </p>

      <Accordion title="Chi tiết">
        <Description text={template.description || template.tagline} />
        <dl className="idp-facts">
          <dt>Loại thiệp</dt>
          <dd>{categoryLabel}</dd>
          {pageCount > 0 && (
            <>
              <dt>Số trang</dt>
              <dd>{pageCount}</dd>
            </>
          )}
          <dt>Đã dùng</dt>
          <dd>{new Intl.NumberFormat("vi-VN").format(template.popularity)} lượt</dd>
          <dt>Phát hành</dt>
          <dd>{new Date(template.createdAt).toLocaleDateString("vi-VN")}</dd>
          <dt>Hình thức</dt>
          <dd>Thiệp online gửi bằng link, tải được ảnh và PDF</dd>
        </dl>
      </Accordion>

      <Accordion title="Đặc trưng">
        <ul className="idp-features">
          {FEATURES.map((text, i) => (
            <li key={i}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                {FEATURE_ICON_PATHS[i]}
              </svg>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        {template.features.length > 0 && (
          <ul className="mt-4 grid gap-2">
            {template.features.map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-[#0E1B2C]">
                <Check className="mt-0.5 size-4 shrink-0 text-[#27548A]" aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </Accordion>

      <Accordion title="Chia sẻ mẫu này" defaultOpen={false}>
        <ShareRow template={template} url={url} />
      </Accordion>
    </aside>
  );
}

/* ---------- Modal xem trước ---------- */

function PreviewModal({ template, onClose }: { template: InvitationTemplate; onClose: () => void }) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="idp-modal-overlay" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Xem trước ${template.name}`} className="idp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="idp-modal-top">
          <h2 className="idp-modal-title">{template.name}</h2>
          <div className="flex items-center gap-2">
            <div className="idp-modal-switch" role="group" aria-label="Chọn thiết bị xem">
              <button type="button" className={device === "desktop" ? "is-on" : ""} aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>
                <Monitor className="mr-1 inline size-4 align-[-3px]" aria-hidden />Máy tính
              </button>
              <button type="button" className={device === "mobile" ? "is-on" : ""} aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>
                <Smartphone className="mr-1 inline size-4 align-[-3px]" aria-hidden />Điện thoại
              </button>
            </div>
            <button type="button" className="idp-modal-close" onClick={onClose} aria-label="Đóng xem trước">
              <X aria-hidden />
            </button>
          </div>
        </div>
        <TemplatePreviewScreen template={template} device={device} />
      </div>
    </div>
  );
}

/* ---------- Khối chính ---------- */

export function TemplateDetailStudio({ template, categoryLabel }: { template: InvitationTemplate; categoryLabel: string }) {
  const [active, setActive] = useState<ShowcaseKey>("card");
  const [previewOpen, setPreviewOpen] = useState(false);
  const fallbackUrl = `https://icards.com.vn/templates/${template.slug}`;
  const url = useSyncExternalStore(
    () => () => undefined,
    () => window.location.href.split("?")[0].replace(/\/$/, ""),
    () => fallbackUrl,
  );

  return (
    <>
      <div className="idp-main">
        <ShowcaseRail activeKey={active} onSelect={setActive} onPreview={() => setPreviewOpen(true)} />
        <ShowcaseStage template={template} activeKey={active} onSelect={setActive} onOpenPreview={() => setPreviewOpen(true)} />
        <DetailPanel template={template} categoryLabel={categoryLabel} url={url} onPreview={() => setPreviewOpen(true)} />
      </div>

      {previewOpen && <PreviewModal template={template} onClose={() => setPreviewOpen(false)} />}
    </>
  );
}

/* ---------- Có thể bạn cũng thích ---------- */

export type RecommendationItem = { template: InvitationTemplate; categoryName?: string };

export function TemplateRecommendations({ items }: { items: RecommendationItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;

  const scroll = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <section className="idp-reco" aria-labelledby="reco-title">
      <div className="idp-reco-head">
        <h2 id="reco-title" className="idp-reco-title">Có thể bạn cũng thích</h2>
        <div className="idp-reco-arrows">
          <button type="button" aria-label="Xem mẫu trước" onClick={() => scroll(-1)}>
            <ChevronLeft className="mx-auto size-5" aria-hidden />
          </button>
          <button type="button" aria-label="Xem mẫu tiếp theo" onClick={() => scroll(1)}>
            <ChevronRight className="mx-auto size-5" aria-hidden />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="idp-reco-track">
        {items.map(({ template, categoryName }) => (
          <div key={template.slug} className="idp-reco-item">
            <TemplateCard template={template} categoryName={categoryName} />
          </div>
        ))}
      </div>
    </section>
  );
}
