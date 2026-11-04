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
  css: {
    preprocessorOptions: {
      scss: {
        // The stylesheets still use @import and mixed declarations. Both are valid today but
        // removed in Dart Sass 3.0 — silence the noise until the @use migration lands.
        silenceDeprecations: ["import", "mixed-decls"],
      },
    },
  },
  esbuild: {
    // This codebase uses .js files containing JSX — tell esbuild to treat .js as JSX.
    loader: "jsx",
    include: /\.js$/,
  },
  optimizeDeps: {
    // Only the Vite entry should be scanned; public/ and stray HTML files are not app entries.
    entries: ["index.html"],
    esbuildOptions: {
      // The dependency scanner runs its own esbuild pass and ignores the `esbuild` option above,
      // so .js files need the JSX loader here too.
      loader: { ".js": "jsx" },
      jsx: "automatic",
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
