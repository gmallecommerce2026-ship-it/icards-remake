/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Trang Dịch vụ đã gộp vào trang Cửa hàng
    return [{ source: "/services", destination: "/shop#dich-vu", permanent: true }];
  },
  // Proxy /api -> backend (cùng domain: không CORS, cookie đăng nhập hoạt động). Đổi đích bằng API_INTERNAL_URL lúc build.
  async rewrites() {
    const target = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:3001").replace(/\/+$/, "");
    return [{ source: "/api/:path*", destination: `${target}/api/:path*` }];
  },
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;