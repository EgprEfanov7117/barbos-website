import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createLeadMiddleware } from './server/middleware.mjs';

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), {
    name: 'novary-leads',
    configureServer(server) {
      server.middlewares.use(createLeadMiddleware({ ...loadEnv(server.config.mode, server.config.envDir, ''), ...process.env }));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createLeadMiddleware({ ...loadEnv(server.config.mode, server.config.envDir, ''), ...process.env }));
    },
  }],
});
