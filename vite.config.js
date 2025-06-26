import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // equivale a '0.0.0.0'
    port: 5173,
    strictPort: true, // opcional: evita que Vite cambie de puerto automáticamente
  },
});
