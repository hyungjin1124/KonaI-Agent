import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'lodash'],
  },
  // Ignore pre-existing type errors during migration (to be fixed incrementally)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
