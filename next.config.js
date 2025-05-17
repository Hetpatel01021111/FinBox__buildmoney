/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['randomuser.me'],
  },
}

module.exports = nextConfig
