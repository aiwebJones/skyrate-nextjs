/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['skyrate.ai'],
  },
}

module.exports = nextConfig 