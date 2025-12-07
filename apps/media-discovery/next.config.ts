import type { NextConfig } from 'next';
import { withARW } from '@agent-ready-web/nextjs-plugin';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/Cloud Run deployment
  output: 'standalone',

  // Image optimization for TMDB images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
    // Optimize for common poster sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 500],
  },

  // Headers for ARW discovery
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-ARW-Version',
            value: '0.1',
          },
        ],
      },
      {
        source: '/.well-known/arw-manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
      {
        source: '/llms.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
      {
        source: '/:path*.llm.md',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Content-Type',
            value: 'text/markdown; charset=utf-8',
          },
          {
            key: 'X-ARW-Version',
            value: '0.1',
          },
        ],
      },
    ];
  },

  // Rewrites for dynamic .llm.md files
  async rewrites() {
    return [
      // Dynamic movie machine views: /movie/123.llm.md -> /api/movies/123/llm
      {
        source: '/movie/:id.llm.md',
        destination: '/api/movies/:id/llm',
      },
      // Dynamic TV machine views: /tv/123.llm.md -> /api/tv/123/llm
      {
        source: '/tv/:id.llm.md',
        destination: '/api/tv/:id/llm',
      },
    ];
  },

  // Redirects for legacy paths
  async redirects() {
    return [
      {
        source: '/arw-manifest.json',
        destination: '/.well-known/arw-manifest.json',
        permanent: true,
      },
    ];
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Exclude native modules from bundling (works with both Webpack and Turbopack)
  serverExternalPackages: [
    'ruvector',
    '@ruvector/core',
    '@ruvector/sona',
    '@ruvector/sona-darwin-arm64',
    '@ruvector/sona-darwin-x64',
    '@ruvector/sona-linux-x64-gnu',
    '@ruvector/sona-linux-arm64-gnu',
    '@ruvector/sona-win32-x64-msvc',
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withARW({
  ...nextConfig,
  arw: {
    autoGenerate: true, // We're using pre-generated machine views
    outputDir: 'public',
    manifest: {
      siteName: 'AI Media Discovery - Agentics Hackathon',
      homepage: 'https://media-discovery.agentics.org',
      contact: 'hackathon@agentics.org',
      policies: {
        training: {
          allowed: false,
          note: 'Content metadata from TMDB. Training not permitted.',
        },
        inference: {
          allowed: true,
          restrictions: ['attribution_required', 'non_commercial'],
        },
        attribution: {
          required: true,
          format: 'link',
          template: 'Powered by AI Media Discovery',
        },
      },
    },
  },
} as any);
