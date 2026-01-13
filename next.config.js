
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache busting - 2026-01-13T16:15:25.297Z
  generateBuildId: async () => {
    return 'build-1768320925333'
  },
  
  // Force fresh builds
  experimental: {
    isrMemoryCacheSize: 0,
  },
  
  // Disable caching in headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
