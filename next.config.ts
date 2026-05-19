import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.ecomm.ui.com",
        pathname: "/products/**",
      },
      {
        protocol: "https",
        hostname: "itegroup.al",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
