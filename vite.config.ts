import { cp, copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
const pageInputs = [
  "index.html",
  "blog/CoralLauncher.html",
  "blog/DAPLink-STM32.html",
  "blog/EmptyMagazineCleaner.html",
  "blog/RevekBoss.html",
  "blog/SoftwareNotService.html",
  "frequency/index.html",
];

function copyStaticAssets(): Plugin {
  return {
    name: "copy-static-assets",
    async closeBundle() {
      const dist = resolve(root, "dist");
      await mkdir(dist, { recursive: true });

      for (const directory of ["images", "data", "pay"]) {
        await cp(resolve(root, directory), resolve(dist, directory), {
          recursive: true,
          force: true,
        });
      }

      await copyFile(resolve(root, ".nojekyll"), resolve(dist, ".nojekyll"));
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), copyStaticAssets()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pageInputs.map((page) => [page.replace(/[^a-z0-9]/gi, "_"), resolve(root, page)]),
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
  },
});
