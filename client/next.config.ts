import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@io/content-api'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
