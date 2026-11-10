import { NextResponse, type NextRequest } from "next/server";

/**
 * Định tuyến trang quản trị theo domain, để sau này trỏ domain khác vào cùng ứng dụng mà không sửa code.
 *
 * - ADMIN_HOST trống: trang quản trị chạy ở /admin trên mọi domain.
 * - ADMIN_HOST=admin.example.com: trang quản trị CHỈ phục vụ trên host đó (/ -> /admin);
 *   các domain khác truy cập /admin sẽ được chuyển sang ADMIN_HOST.
 *
 * Đổi domain sau này chỉ cần đổi biến môi trường ADMIN_HOST rồi khởi động lại.
 */
export function proxy(req: NextRequest) {
  const adminHost = (process.env.ADMIN_HOST ?? "").trim().toLowerCase().replace(/:\d+$/, "");
  if (!adminHost) return NextResponse.next();

  const url = req.nextUrl;
  const host = (req.headers.get("host") ?? "").toLowerCase().replace(/:\d+$/, "");
  const path = url.pathname;
  const isAdminPath = path === "/admin" || path.startsWith("/admin/");

  if (host === adminHost) {
    if (path === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    const allowed = isAdminPath || path.startsWith("/api") || path.startsWith("/_next") || /\.[a-z0-9]+$/i.test(path);
    if (!allowed) {
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isAdminPath) {
    url.host = adminHost;
    url.port = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
