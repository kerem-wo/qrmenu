/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
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
  // Disable ESLint during builds to avoid warnings breaking deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds (optional, but helpful)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Explicitly set output directory (Next.js default is .next)
  distDir: '.next',
  // Increase API body size limit (Vercel default is 4.5MB)
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
    responseLimit: '4.5mb',
  },
}

module.exports = nextConfig
