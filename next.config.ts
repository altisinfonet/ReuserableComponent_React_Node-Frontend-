import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: '192.168.1.101:5001',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
