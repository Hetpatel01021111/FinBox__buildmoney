/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    },
  },
  images: {
    domains: ['randomuser.me'],
  },
  // Special handling for Vercel deployment
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },
}

// This helps with Prisma issues during build
if (process.env.VERCEL) {
  console.log('Building on Vercel...');
}

module.exports = nextConfig
