/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['v5.airtableusercontent.com'],
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 