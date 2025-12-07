import type { NextConfig } from 'next';
import path from 'path';

const INTERNAL_PACKAGES = ['@workspace/common', '@workspace/ui'];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ['@arw/geo', ...INTERNAL_PACKAGES],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-tooltip',
      ...INTERNAL_PACKAGES
    ]
  },
  // Configure Turbopack root for pnpm workspaces
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  poweredByHeader: false,
  // Enable CORS for development
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};

export default nextConfig;
