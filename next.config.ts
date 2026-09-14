import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Images des offres Epic Games réelles (voir src/lib/providers/epic-games.ts).
      { protocol: "https", hostname: "cdn1.epicgames.com" },
      { protocol: "https", hostname: "cdn2.unrealengine.com" },
    ],
  },
};

export default nextConfig;
