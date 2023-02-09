import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import unocss from "@unocss/vite";
// @ts-ignore
import { config as unocssConfig } from "./unocss.config";

import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      sourcemap: true,
    },
    plugins: [
      react(),
      unocss(unocssConfig),
      tsconfigPaths(),
      sentryVitePlugin({
        org: "consolelabs",
        project: mode === "production" ? "verse-web-prod" : "verse-web-dev",
        include: "./dist",
        authToken: env.VITE_SENTRY_AUTH_TOKEN,
      }),
    ],
    server: { host: "0.0.0.0", port: 8000 },
    clearScreen: false,
  };
});
