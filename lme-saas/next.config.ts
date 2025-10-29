import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable turbopack due to Japanese path issue
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
