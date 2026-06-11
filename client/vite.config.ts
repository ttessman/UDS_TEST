import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import unplugin from "@beqa/unplugin-transform-react-slots";

export default defineConfig({
  plugins: [unplugin.vite(), react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001"
    }
  }
});
