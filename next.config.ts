import type { NextConfig } from "next";

const config: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
};

export default config;
