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
    // Use the same env var resolution as /api/proxy so this works in production
    // (Vercel → Render). Falls back to localhost only for local development.
    const apiBase =
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:4000';
    const base = apiBase.replace(/\/+$/, '');

    return [
      {
        source: '/api/zoom/:path*',
        destination: `${base}/api/zoom/:path*`,
      },
      {
        source: '/api/teams/:path*',
        destination: `${base}/api/teams/:path*`,
      },
      {
        source: '/api/google-meet/:path*',
        destination: `${base}/api/google-meet/:path*`,
      },
      {
        source: '/api/google-slides/:path*',
        destination: `${base}/api/google-slides/:path*`,
      },
    ];
  },
  async headers() {
    // Allow platform side panels (Zoom, Google Meet, Teams) to embed app pages in iframes.
    const iframeHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'ALLOWALL',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "frame-ancestors 'self'",
          'https://meet.google.com',
          'https://*.meet.google.com',
          'https://meetingtools.googleapis.com',
          'https://*.zoom.us',
          'https://zoom.us',
          'https://*.teams.microsoft.com',
          'https://teams.microsoft.com',
          // Office Add-ins (PowerPoint task pane)
          'https://*.officeapps.live.com',
          'https://officeapps.live.com',
          'https://*.office.com',
          'https://office.com',
          'https://*.sharepoint.com',
          'https://*.microsoft.com',
        ].join(' '),
      },
    ];
    return [
      { source: '/meet/:path*', headers: iframeHeaders },
      { source: '/zoom/:path*', headers: iframeHeaders },
      { source: '/teams/:path*', headers: iframeHeaders },
      { source: '/powerpoint/:path*', headers: iframeHeaders },
      { source: '/event/:path*', headers: iframeHeaders },
    ];
  },
};

export default nextConfig;
