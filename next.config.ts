import type { NextConfig } from "next";

const repo = "thbt-demo";
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
  // Exposed to the client so withBase() can prefix files in /public.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
