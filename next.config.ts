import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode catches potential React issues during development
  reactStrictMode: true,

  // Disable the X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
