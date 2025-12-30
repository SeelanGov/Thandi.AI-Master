/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Force fresh builds
  generateBuildId: async () => {
    return 'build-1767126994655'
  }
};

module.exports = nextConfig;
