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
  // Improve cache reliability
  generateBuildId: async () => {
    // You can use the commit hash if available, or a timestamp
    // For now, simple timestamp to ensure uniqueness per build
    return `build-${Date.now()}`
  },
};

export default nextConfig;
