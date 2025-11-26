// next.config.ts
import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// Załaduj .env z głównego katalogu
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  output: "standalone", // Dodaj to!
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**", // Wszystkie hosty HTTPS
      },
      {
        protocol: "http",
        hostname: "**", // Wszystkie hosty HTTP
      },
    ],
  },
};

export default nextConfig;
