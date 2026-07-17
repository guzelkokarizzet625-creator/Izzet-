/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopack: {
      root: "./",
    },
  },
}

module.exports = nextConfig
