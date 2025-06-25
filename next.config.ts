import type { NextConfig } from "next";

import withSerwistInit from "@serwist/next";

const withPWA = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development"
});

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

export default withPWA(nextConfig) as NextConfig;
