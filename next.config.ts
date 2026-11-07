import type { NextConfig } from "next";

// GitHub Pages serves project sites from a sub-path (e.g. /<repo>/). The
// GitHub Actions workflow sets BASE_PATH automatically; other hosts (Vercel,
// Netlify, local dev) leave it empty and the app serves from the root.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
