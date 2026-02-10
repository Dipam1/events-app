import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
