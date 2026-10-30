import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
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
        hostname: "youtube.com",
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
        hostname: "youtu.be",
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
        source: "/art-toys/cabinet-noir",
        destination: "/collections/cabinet-noir",
        permanent: true,
      },
      // Redirections SEO de l'ancienne arborescence (/categorie/...) vers la V2.1
      {
        source: "/categorie/fidgets",
        destination: "/tactile/fidgets",
        permanent: true,
      },
      {
        source: "/categorie/clickers",
        destination: "/tactile/clickers",
        permanent: true,
      },
      {
        source: "/categorie/mecanismes",
        destination: "/tactile/mecanismes",
        permanent: true,
      },
      {
        source: "/categorie/geek-gaming",
        destination: "/objets-deco/supports",
        permanent: true,
      },
      {
        source: "/categorie/animaux-figurines",
        destination: "/art-toys/creatures-curiosites",
        permanent: true,
      },
      {
        source: "/categorie/accessoires",
        destination: "/objets-deco/bureau",
        permanent: true,
      },
      {
        source: "/categorie/porte-cles",
        destination: "/tactile/fidgets",
        permanent: true,
      },
      {
        source: "/categorie/jeux-activites",
        destination: "/tabletop/jeux",
        permanent: true,
      },
      {
        source: "/categorie/decoration",
        destination: "/objets-deco/decoration",
        permanent: true,
      },
      {
        source: "/categorie/boite-sac-cadeau",
        destination: "/objets-deco/rangement",
        permanent: true,
      },
      {
        source: "/categorie/pochettes-surprise",
        destination: "/blind-bags",
        permanent: true,
      },
      {
        source: "/categorie/art-toys",
        destination: "/art-toys/art-toys",
        permanent: true,
      },
      {
        source: "/categorie/cabinet-noir",
        destination: "/collections/cabinet-noir",
        permanent: true,
      },
      {
        source: "/categorie/bijoux",
        destination: "/objets-deco/decoration",
        permanent: true,
      },
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
        destination: "/objets-deco/decoration",
        permanent: true,
      },
      {
        source: "/product/boucles-d'oreilles---feuilles-été",
        destination: "/objets-deco/decoration",
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
