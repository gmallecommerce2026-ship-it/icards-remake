import Link from "next/link";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 ${className}`}>{children}</div>;
}

export function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`py-20 lg:py-28 ${className}`}><Container>{children}</Container></section>;
}

/** Đầu trang cho mọi trang con: cùng cỡ chữ, cùng khoảng cách */
export function PageHero({ title, description, crumbs, eyebrow, children }: {
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  /** Nhãn nhỏ phía trên tiêu đề */
  eyebrow?: string;
  /** Khu vực tuỳ chọn dưới mô tả (ô tìm kiếm, nút...) */
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-white pt-[72px]">
      <Container className="py-14 lg:py-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href="/" className="hover:text-lacquer">Trang chủ</Link>
            {crumbs.map((c) => (
              <span key={c.label} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {c.href ? <Link href={c.href} className="hover:text-lacquer">{c.label}</Link> : <span className="text-ink">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <p className="mb-5 inline-flex items-center gap-2 rounded-sm bg-lacquer-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-lacquer">
            <span aria-hidden className="size-1.5 rounded-full bg-lacquer" />
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </div>
  );
}

const base = "inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const sizes = { md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base" };
const variants = {
  primary: "bg-lacquer text-white hover:bg-lacquer-dark",
  secondary: "border border-line bg-white text-ink hover:border-ink hover:text-ink",
  ghost: "text-lacquer hover:bg-lacquer-soft",
};
export const btn = (v: keyof typeof variants = "primary", s: keyof typeof sizes = "md", extra = "") => `${base} ${sizes[s]} ${variants[v]} ${extra}`;
