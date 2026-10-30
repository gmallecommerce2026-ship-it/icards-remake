import type { ReactNode } from "react";
import type { Product, ThumbKind } from "@/lib/shop";

const stroke = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const shapes: Record<ThumbKind, ReactNode> = {
  paper: (
    <>
      <rect x="26" y="16" width="52" height="62" rx="3" transform="rotate(-7 52 47)" fill="currentColor" fillOpacity=".14" {...stroke} />
      <rect x="42" y="14" width="52" height="62" rx="3" fill="#fff" {...stroke} />
      <path d="M52 34h32M52 44h32M52 54h20" {...stroke} fill="none" />
    </>
  ),
  qr: (
    <>
      <rect x="32" y="14" width="56" height="56" rx="4" fill="#fff" {...stroke} />
      <rect x="40" y="22" width="14" height="14" fill="none" {...stroke} />
      <rect x="66" y="22" width="14" height="14" fill="none" {...stroke} />
      <rect x="40" y="48" width="14" height="14" fill="none" {...stroke} />
      <rect x="44" y="26" width="6" height="6" fill="currentColor" />
      <rect x="70" y="26" width="6" height="6" fill="currentColor" />
      <rect x="44" y="52" width="6" height="6" fill="currentColor" />
      <rect x="66" y="48" width="6" height="6" fill="currentColor" />
      <rect x="76" y="58" width="6" height="6" fill="currentColor" />
      <rect x="58" y="40" width="6" height="6" fill="currentColor" />
    </>
  ),
  standee: (
    <>
      <rect x="40" y="8" width="40" height="60" rx="2" fill="#fff" {...stroke} />
      <rect x="50" y="18" width="20" height="20" fill="none" {...stroke} />
      <path d="M48 48h24M52 56h16" {...stroke} fill="none" />
      <path d="M60 68 46 82M60 68l14 14" {...stroke} fill="none" />
    </>
  ),
  envelope: (
    <>
      <rect x="20" y="24" width="80" height="50" rx="3" fill="#fff" {...stroke} />
      <path d="m21 28 39 28 39-28" {...stroke} fill="none" />
    </>
  ),
  message: (
    <>
      <rect x="38" y="8" width="44" height="74" rx="8" fill="#fff" {...stroke} />
      <rect x="46" y="22" width="26" height="11" rx="5.5" fill="currentColor" fillOpacity=".18" {...stroke} />
      <rect x="48" y="38" width="26" height="11" rx="5.5" fill="currentColor" />
      <rect x="46" y="54" width="20" height="11" rx="5.5" fill="currentColor" fillOpacity=".18" {...stroke} />
    </>
  ),
  gift: (
    <>
      <rect x="30" y="42" width="60" height="34" rx="3" fill="#fff" {...stroke} />
      <rect x="26" y="30" width="68" height="14" rx="3" fill="#fff" {...stroke} />
      <path d="M60 30v46" {...stroke} fill="none" />
      <path d="M60 30C50 12 34 22 60 30ZM60 30c10-18 26-8 0 0Z" fill="none" {...stroke} />
    </>
  ),
};

export function ProductThumb({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex aspect-[4/3] items-center justify-center ${className}`}
      style={{ background: product.tone.bg, color: product.tone.ink }}
    >
      <svg viewBox="0 0 120 90" className="h-[68%] w-auto" fill="none">
        {shapes[product.thumb]}
      </svg>
    </div>
  );
}
