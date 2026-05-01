import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    // serverActions: false, // User requested to disable, but in Next 15+ they are standard. 
    // We'll keep it commented or omit to avoid errors if the version is incompatible, 
    // but the following is the most important for build-safety:
  }
};

export default nextConfig;
