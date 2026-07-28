import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "spoolio.fr",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.wp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.linktr.ee",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
