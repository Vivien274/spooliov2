import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.spoolio.fr",
        port: "",
        pathname: "/**",
      },
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
        hostname: "*.supabase.co",
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
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.youtube.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ytimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/produit/:slug*",
        destination: "/product/:slug*",
        permanent: true,
      },
      {
        source: "/medaillon-nfc-chien-et-chat",
        destination: "/medaillon-nfc-chien-chat",
        permanent: true,
      },
      {
        source: "/product/clicker-mecanique-sur-mesure",
        destination: "/createur-cliqueur",
        permanent: true,
      },
      {
        source: "/product/oeuf-de-serpent-dragon",
        destination: "/product/oeuf-serpent-dinosaure-petit",
        permanent: true,
      },
      {
        source: "/product/boucles-doreilles-feuilles-ete",
        destination: "/categorie/bijoux",
        permanent: true,
      },
      {
        source: "/product/boucles-d'oreilles---feuilles-été",
        destination: "/categorie/bijoux",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, apikey" },
        ],
      },
    ];
  },
};

export default nextConfig;
