import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.[tj]sx?$/,
      babel: {
        babelrc: false,
        configFile: false,
        presets: [["@babel/preset-react", { runtime: "automatic" }]],
      },
    }),
  ],
  // CRA-style env vars (REACT_APP_*) keep working alongside Vite's VITE_* prefix.
  envPrefix: ["VITE_", "REACT_APP_"],
  esbuild: {
    // This codebase uses .js files containing JSX — tell esbuild to treat .js as JSX.
    loader: "jsx",
    include: /\.[tj]sx?$/,
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
