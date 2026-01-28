/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable TypeScript errors during builds (optional, but helpful)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Silence "workspace root inferred incorrectly" when multiple lockfiles exist
  turbopack: {
    root: __dirname,
  },
  // Explicitly set output directory (Next.js default is .next)
  distDir: '.next',
}

module.exports = nextConfig
