/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app', '*.github.io']
    },
  },
  images: {
    domains: ['randomuser.me'],
    unoptimized: true,
  },
  // Special handling for deployment
  env: {
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'development',
  },
  // For GitHub Pages
  output: 'export',
  distDir: 'out',
  // GitHub Pages adds a trailing slash by default
  trailingSlash: true,
}

module.exports = nextConfig
