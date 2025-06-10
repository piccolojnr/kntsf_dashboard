import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // res.cloudinary.com
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ]
  }
};

export default nextConfig;
