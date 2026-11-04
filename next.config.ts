import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // English URLs (/menu) are rewritten by proxy.ts to the internal /en/menu, Arabic URLs (/ar/menu) are not.
    // With optimistic routing the client learns "/ar" → [lang] and then predicts /menu as [lang]="menu",
    // which makes prefetches 404 until it notices the rewrite. Let the server resolve every route instead.
    optimisticRouting: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    // the admin preview has no authentication – keep it out of search results even if linked
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/admin", headers: noindex },
      { source: "/ar/admin", headers: noindex },
    ];
  },
};

export default nextConfig;
