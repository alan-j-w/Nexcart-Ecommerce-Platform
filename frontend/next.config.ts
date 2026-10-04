import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.56.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  turbopack: {
    // Explicitly set root to this directory to avoid the "multiple lockfiles" warning
    // caused by the root-level package-lock.json in the monorepo parent folder.
    root: __dirname,
  },
};

export default nextConfig;
