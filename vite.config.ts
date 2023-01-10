import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import unocss from "@unocss/vite";
import presetUno from "@unocss/preset-uno";

export default defineConfig((config) => {
  return {
    plugins: [
      react(),
      unocss({
        presets: [presetUno()],
      }),
    ],
    server: { host: "0.0.0.0", port: 8000 },
    clearScreen: false,
    publicDir: config.mode === "production" ? "." : "public",
  };
});
