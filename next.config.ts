import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],

  typescript: {
    ignoreBuildErrors: true,
  },

  // 👇 IMPORTANT FIX
  turbopack: {}, // forces compatibility mode
};

export default nextConfig;
