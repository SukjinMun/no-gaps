import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, Vite sends /api requests to Express, so the browser sees
// one origin and no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
