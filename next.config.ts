import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // Enable compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "dipam-events-project.s3.us-east-1.amazonaws.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
