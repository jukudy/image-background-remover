import path from "node:path";

const localWranglerConfigHome = path.join(process.cwd(), ".wrangler-config");
process.env.XDG_CONFIG_HOME ??= localWranglerConfigHome;
process.env.WRANGLER_HOME ??= localWranglerConfigHome;

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then((mod) => mod.initOpenNextCloudflareForDev());
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
