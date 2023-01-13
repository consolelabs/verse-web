import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import unocss from "@unocss/vite";
// @ts-ignore
import { config as unocssConfig } from "./unocss.config";

export default defineConfig((config) => {
  return {
    plugins: [react(), unocss(unocssConfig), tsconfigPaths()],
    server: { host: "0.0.0.0", port: 8000 },
    clearScreen: false,
  };
});
