import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), reactRouter()],
  ssr: {
    // Force these browser-only libs to be bundled into the server output
    // instead of left as external node_modules (fixes ESM/CJS interop on Vercel)
    noExternal: ["tinykeys"],
  },
});
