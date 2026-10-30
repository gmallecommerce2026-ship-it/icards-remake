/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Bắt buộc: Chuyển Next.js sang chế độ export file tĩnh
  images: {
    unoptimized: true, // Bắt buộc: GitHub Pages không hỗ trợ tính năng tối ưu ảnh mặc định của Next.js
  },
  // Chỉ thêm dòng dưới đây nếu URL dạng: tên-tài-khoản.github.io/tên-repository/
  // basePath: '/ten-repository-cua-ban', 
};

export default nextConfig;
