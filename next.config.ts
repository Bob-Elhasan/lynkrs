import type { NextConfig } from "next";

const basePath = process.env.PAGES_BASE_PATH;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Next prefixes basePath for Link/Image, but not for URLs handed to a
  // loader (the GLB). Expose it so client code can prefix them itself.
  env: { NEXT_PUBLIC_BASE_PATH: basePath ?? "" },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
