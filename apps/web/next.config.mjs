import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle for the Docker runtime stage
  // (apps/web/.next/standalone + server.js). Required by apps/web/Dockerfile.
  output: 'standalone',
  // Monorepo: trace files from the repo root so the standalone bundle includes
  // the hoisted node_modules and keeps the apps/web/server.js layout.
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  // Transpile the shared workspace package so its TS is compiled by Next.
  transpilePackages: ['@iep/types'],
  async rewrites() {
    return [
      {
        source: '/api/zoom/:path*',
        destination: 'http://localhost:4000/api/zoom/:path*'
      },
      {
        source: '/api/teams/:path*',
        destination: 'http://localhost:4000/api/teams/:path*'
      },
      {
        source: '/api/google-meet/:path*',
        destination: 'http://localhost:4000/api/google-meet/:path*'
      },
      {
        source: '/api/google-slides/:path*',
        destination: 'http://localhost:4000/api/google-slides/:path*'
      }
    ];
  }
};

export default nextConfig;
