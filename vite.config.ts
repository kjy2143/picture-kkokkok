import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,svg,woff2}",
          "catalog.json",
          "mode-*.webp",
          "font-license.txt",
        ],
        globIgnores: ["games/**"],
      },
      manifest: {
        name: "그림콕콕",
        short_name: "그림콕콕",
        lang: "ko",
        description: "나만의 속도로 즐기는 틀린그림찾기와 숨은그림찾기",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#faf6ec",
        theme_color: "#faf6ec",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
