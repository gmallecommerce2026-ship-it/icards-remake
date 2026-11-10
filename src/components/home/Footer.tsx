import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FooterFlap } from "./FooterFlap";

const BRAND = "#27548A";

const cols = [
  { t: "Sản phẩm", l: [["Mẫu thiệp", "/templates"], ["Thiết kế thiệp", "/canvas"], ["Cửa hàng", "/shop"]] },
  { t: "Hỗ trợ", l: [["Hỏi đáp", "/faq"], ["Blog", "/blog"], ["Dịch vụ chuyên nghiệp", "/professional"]] },
  { t: "Tài khoản", l: [["Đăng nhập", "/sign-in"], ["Đăng ký", "/sign-up"], ["Quản lý thiệp", "/invitation-management"]] },
] as const;

const legal = [["Chính sách bảo mật", "/privacy"], ["Điều khoản sử dụng", "/terms"]] as const;

export function Footer() {
  return (
    <footer className="border-t border-line bg-white text-ink">
      <FooterFlap />

      {/* Lời mời hành động: nằm "trong phong bì" ngay dưới dấu sáp */}
      <section aria-labelledby="footer-cta" className="mx-auto max-w-2xl px-5 pb-16 pt-12 text-center">
        <h2 id="footer-cta" className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          Sẵn sàng làm thiệp cho ngày vui của bạn?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted sm:text-base">
          Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.
        </p>
        <Link
          href="/templates"
          className="group mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-[#27548A] px-7 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(39,84,138,0.7)] transition-colors hover:bg-[#1b3d66]"
        >
          Xem mẫu thiệp
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </section>

      {/* Điều hướng */}
      <div className="border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <p className="text-2xl font-bold tracking-tight" style={{ color: BRAND }}>iCards</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Nền tảng thiệp cưới online và quản lý khách mời dành cho các cặp đôi Việt.
            </p>
          </div>

          {cols.map((c) => (
            <nav key={c.t} aria-label={c.t}>
              <p className="text-sm font-semibold text-ink">{c.t}</p>
              <ul className="mt-5 space-y-3">
                {c.l.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted transition-colors hover:text-[#27548A] hover:underline hover:decoration-[#27548A]/40 hover:underline-offset-4"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Thanh dưới cùng */}
      <div className="border-t border-line bg-porcelain">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} iCards. Bảo lưu mọi quyền.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legal.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-[#27548A]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
