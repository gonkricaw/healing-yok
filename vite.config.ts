import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Chunk three.js (~140 kB gzip) dan Remotion sengaja besar tapi di-lazy-load, bukan bagian bundle awal.
  build: { chunkSizeWarningLimit: 600 },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
})
