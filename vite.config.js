import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.[tj]sx?$/,
    }),
  ],
  // CRA-style env vars (REACT_APP_*) keep working alongside Vite's VITE_* prefix.
  envPrefix: ["VITE_", "REACT_APP_"],
  css: {
    preprocessorOptions: {
      scss: {
        // The stylesheets still use @import and mixed declarations. Both are valid today but
        // removed in Dart Sass 3.0 — silence the noise until the @use migration lands.
        silenceDeprecations: ["import", "mixed-decls"],
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
