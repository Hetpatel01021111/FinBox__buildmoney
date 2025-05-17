/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'finbox-py79g0g6j-hetpatel01021111s-projects.vercel.app']
    },
  },
  images: {
    domains: ['randomuser.me'],
  },
}

module.exports = nextConfig
