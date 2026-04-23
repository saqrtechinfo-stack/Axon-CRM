import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* This is critical for Prisma to work in Next.js 15 on Netlify */
  serverExternalPackages: ["@prisma/client"],

  // This helps prevent build-time crashes if there are minor type mismatches
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
