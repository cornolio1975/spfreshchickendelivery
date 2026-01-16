import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Safari compatibility improvements
  compiler: {
    removeConsole: false,
  },
  // Force browser to revalidate HTML to prevent 404 chunk errors
  headers: async () => {
    return [
      {
        // Match all paths EXCEPT _next (static files), favicon, and api
        source: '/((?!_next|favicon.ico|api).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
