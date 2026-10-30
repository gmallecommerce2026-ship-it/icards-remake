import Link from "next/link";

const cols = [
  { t: "Sản phẩm", l: [["Mẫu thiệp", "/invitations"], ["Thiết kế thiệp", "/canvas"], ["Cửa hàng", "/shop"]] },
  { t: "Hỗ trợ", l: [["Hỏi đáp", "/faq"], ["Blog", "/page"], ["Dịch vụ chuyên nghiệp", "/professional"]] },
  { t: "Tài khoản", l: [["Đăng nhập", "/sign-in"], ["Đăng ký", "/sign-up"], ["Quản lý thiệp", "/invitation-management"]] },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <p className="text-2xl font-bold tracking-tight text-lacquer">iCards</p>
          <p className="mt-3 max-w-xs text-sm text-muted">Nền tảng thiệp cưới online và quản lý khách mời dành cho các cặp đôi Việt.</p>
        </div>
        {cols.map((c) => (
          <div key={c.t}>
            <p className="font-semibold">{c.t}</p>
            <ul className="mt-4 space-y-2.5">
              {c.l.map(([label, href]) => (
                <li key={href}><Link href={href} className="text-sm text-muted transition hover:text-lacquer">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line py-5 text-center text-sm text-muted">© {new Date().getFullYear()} iCards. Bảo lưu mọi quyền.</div>
    </footer>
  );
}
