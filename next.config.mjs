/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/tracker-app',
  // assetPrefix: '/tracker-app/',
  // trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
