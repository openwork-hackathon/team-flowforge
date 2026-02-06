/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force cache invalidation - rebuild trigger
  generateBuildId: async () => `build-${Date.now()}`,
};
module.exports = nextConfig;
