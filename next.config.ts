import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow cross-origin requests in development to fix HMR issues
  allowedDevOrigins: ['192.168.1.3', 'localhost', '127.0.0.1'],
};

export default nextConfig;
