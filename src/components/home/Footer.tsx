import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BRAND = "#27548A";
const BRAND_DARK = "#1b3d66";

const cols = [
  { t: "Sản phẩm", l: [["Mẫu thiệp", "/templates"], ["Thiết kế thiệp", "/canvas"], ["Cửa hàng", "/shop"]] },
  { t: "Hỗ trợ", l: [["Hỏi đáp", "/faq"], ["Blog", "/blog"], ["Dịch vụ chuyên nghiệp", "/professional"]] },
  { t: "Tài khoản", l: [["Đăng nhập", "/sign-in"], ["Đăng ký", "/sign-up"], ["Quản lý thiệp", "/invitation-management"]] },
] as const;

const legal = [["Chính sách bảo mật", "/privacy"], ["Điều khoản sử dụng", "/terms"]] as const;

export function Footer() {
  return (
    <footer className="text-white" style={{ backgroundColor: BRAND }}>
      {/* Dải kêu gọi hành động */}
      <div className="border-b border-white/15" style={{ backgroundColor: BRAND_DARK }}>
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-8 sm:flex-row sm:items-center lg:px-8">
          <div>
            <p className="text-lg font-bold">Sẵn sàng làm thiệp cho ngày vui của bạn?</p>
            <p className="mt-1 text-sm text-white/75">Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.</p>
          </div>
          <Link
            href="/templates"
            className="inline-flex h-11 shrink-0 items-center gap-2 bg-white px-6 text-sm font-semibold transition hover:bg-white/90"
            style={{ color: BRAND }}
          >
            Xem mẫu thiệp
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:px-8">
        <div>
          <p className="text-2xl font-bold tracking-tight">iCards</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">
            Nền tảng thiệp cưới online và quản lý khách mời dành cho các cặp đôi Việt.
          </p>
        </div>

        {cols.map((c) => (
          <nav key={c.t} aria-label={c.t}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">{c.t}</p>
            <ul className="mt-5 space-y-3">
              {c.l.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/90 transition-colors hover:text-white hover:underline hover:underline-offset-4">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Thanh dưới cùng */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-white/75 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} iCards. Bảo lưu mọi quyền.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legal.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-white">
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
