import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.r2.dev" },
    ],
  },
  serverExternalPackages: ["@neondatabase/serverless"],
  webpack(config) {
    // Raw loader for PHP/HTML files imported with ?raw
    config.module.rules.push({
      test: /\.(php|html)$/,
      resourceQuery: /raw/,
      type: "asset/source",
    });
    // Raw loader for CSS files imported with ?raw (must be before the normal CSS rules)
    // Find and modify the existing CSS rule to exclude ?raw queries
    config.module.rules = config.module.rules.map((rule: { test?: RegExp; oneOf?: unknown[] }) => {
      if (rule.test instanceof RegExp && rule.test.test(".css") && rule.oneOf) {
        return {
          ...rule,
          oneOf: [
            { resourceQuery: /raw/, type: "asset/source" },
            ...rule.oneOf,
          ],
        };
      }
      return rule;
    });
    return config;
  },
};

export default nextConfig;
