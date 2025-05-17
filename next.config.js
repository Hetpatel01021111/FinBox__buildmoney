/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.onrender.com']
    },
  },
  images: {
    domains: ['randomuser.me'],
  },
  // Special handling for deployment
  env: {
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'development',
  },
}

module.exports = nextConfig
