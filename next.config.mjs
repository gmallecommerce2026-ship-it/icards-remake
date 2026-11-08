/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Trang Dịch vụ đã gộp vào trang Cửa hàng
    return [{ source: "/services", destination: "/shop#dich-vu", permanent: true }];
  },
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;