/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ["images.clerk.dev", "img.clerk.com"],
    },
    experimental: {
      serverActions: true,
    },
  }
  
  module.exports = nextConfig
  
  