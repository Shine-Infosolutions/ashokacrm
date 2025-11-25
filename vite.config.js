import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://askhoka-api.shineinfosolutions.in',
        changeOrigin: true,
        secure: true,
      }
    }
  },

  preview: {
    port: 5173,
    host: true,
    allowedHosts: ['ashoka-frontend.shineinfosolutions.in']   // ✅ Correct location
  }
});
