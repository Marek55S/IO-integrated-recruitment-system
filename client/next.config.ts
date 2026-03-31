import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@io/content-api'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
