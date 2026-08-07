import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (production)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      // Fallback: any Supabase subdomain (for local dev)
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      // Common image CDNs used in seed data
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      // Google Cloud Storage (sample videos)
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
