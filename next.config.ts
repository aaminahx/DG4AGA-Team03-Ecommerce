import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      allowedOrigins:
        process.env.NODE_ENV === "development"
          ? ["localhost:3000"]
          : [],
    },
  },
};

export default nextConfig;