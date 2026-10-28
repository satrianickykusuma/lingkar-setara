import type { NextConfig } from "next";

/**
 * `workerThreads` exists for one reason: in the restricted shell this project was
 * developed in, `next build` could not fork child processes for prerendering. It is
 * a local workaround, not a production requirement — and Netlify's build image is a
 * normal one, so it is switched off there via NETLIFY=true.
 */
const onNetlify = process.env.NETLIFY === "true";

const nextConfig: NextConfig = {
  // Type checking runs as its own step (`npm run typecheck`) so the build does not
  // need to spawn a second toolchain process.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    ...(onNetlify ? {} : { workerThreads: true }),
  },
  images: {
    // Local assets are generated placeholders; the optimizer still serves
    // responsive/WebP/AVIF variants for them.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
