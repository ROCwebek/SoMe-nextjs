import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // produces a minimal .next/standalone server for the Docker runtime stage
  output: "standalone",
};

export default nextConfig;
