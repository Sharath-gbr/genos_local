/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This allows the build to continue even with TypeScript errors
    typedRoutes: false,
    // This allows the build to continue even with ESLint errors
    forceSwcTransforms: true
  },
  eslint: {
    // This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v5.airtableusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.airtableusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
        pathname: '/**'
      }
    ],
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  port: 3001
};

module.exports = nextConfig;