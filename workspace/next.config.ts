import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Next.js to use Webpack instead of Turbopack
  webpack: (config) => {
    return config;
  },
  // Ensure images work without native 'sharp' binary in WebContainers
  images: {
    unoptimized: true,
  },
};

export default nextConfig;