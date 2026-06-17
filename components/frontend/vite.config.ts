import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import unplugin from "@beqa/unplugin-transform-react-slots";

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:3001";
const docsProxyTarget = process.env.VITE_DOCS_PROXY_TARGET ?? "http://localhost:3002";

export default defineConfig({
  plugins: [unplugin.vite(), react()],
  server: {
    port: 5173,
    proxy: {
      "/api": apiProxyTarget,
      "/docs": {
        target: docsProxyTarget,
        rewrite: (path) => path.replace(/^\/docs\/?/, "/")
      }
    }
  }
});
