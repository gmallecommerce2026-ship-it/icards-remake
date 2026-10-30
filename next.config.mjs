/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  basePath: '/icards-remake',
  assetPrefix: '/icards-remake/',
};

export default nextConfig;