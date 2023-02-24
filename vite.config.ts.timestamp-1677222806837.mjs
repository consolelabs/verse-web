// vite.config.ts
import { defineConfig as defineConfig2, loadEnv } from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/vite-tsconfig-paths/dist/index.mjs";
import react from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/@vitejs/plugin-react/dist/index.mjs";
import unocss from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/@unocss/vite/dist/index.mjs";

// unocss.config.ts
import presetUno from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/@unocss/preset-uno/dist/index.mjs";
import presetIcons from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/@unocss/preset-icons/dist/index.mjs";
import transformerVariantGroup from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/@unocss/transformer-variant-group/dist/index.mjs";
import { defineConfig } from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/unocss/dist/index.mjs";
var cols = Array(5).fill(0).map((_, i) => `grid-cols-${i + 1}`).join(" ");
var rows = Array(5).fill(0).map((_, i) => `grid-rows-${i + 1}`).join(" ");
var config = defineConfig({
  presets: [presetIcons(), presetUno()],
  transformers: [transformerVariantGroup()],
  shortcuts: {
    btn: "shadow-md flex items-center z-10 disabled:filter-grayscale disabled:opacity-90 uppercase font-semibold rounded disabled:hover:brightness-100 hover:brightness-110 transition-all duration-75 ease-in-out",
    "btn-primary-blue": "bg-#19A8F5 text-white",
    "btn-primary-pink": "bg-#ef3fff text-white",
    "btn-lg": "text-2xl px-8 py-2",
    "btn-md": "text-lg px-6 py-1",
    "btn-sm": "text-base px-4 py-1"
  },
  safelist: `${cols} ${rows}`.split(" "),
  theme: {
    colors: {
      typo: {
        secondary: "#C3E6FF",
        tertiary: "#7183A1"
      },
      background: {
        primary: "#151321",
        secondary: "#2D2D45",
        tertiary: "#373458"
      }
    }
  }
});

// vite.config.ts
import { sentryVitePlugin } from "file:///Users/vincent/Desktop/work/consolelabs/verse-web/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
var vite_config_default = defineConfig2(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    build: {
      sourcemap: true
    },
    plugins: [
      react(),
      unocss(config),
      tsconfigPaths(),
      sentryVitePlugin({
        org: "consolelabs",
        project: mode === "production" ? "verse-web-prod" : "verse-web-dev",
        include: "./dist",
        authToken: env.VITE_SENTRY_AUTH_TOKEN
      })
    ],
    server: { host: "0.0.0.0", port: 8e3 },
    clearScreen: false
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidW5vY3NzLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy92aW5jZW50L0Rlc2t0b3Avd29yay9jb25zb2xlbGFicy92ZXJzZS13ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy92aW5jZW50L0Rlc2t0b3Avd29yay9jb25zb2xlbGFicy92ZXJzZS13ZWIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3ZpbmNlbnQvRGVza3RvcC93b3JrL2NvbnNvbGVsYWJzL3ZlcnNlLXdlYi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHVub2NzcyBmcm9tIFwiQHVub2Nzcy92aXRlXCI7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBjb25maWcgYXMgdW5vY3NzQ29uZmlnIH0gZnJvbSBcIi4vdW5vY3NzLmNvbmZpZ1wiO1xuXG5pbXBvcnQgeyBzZW50cnlWaXRlUGx1Z2luIH0gZnJvbSBcIkBzZW50cnkvdml0ZS1wbHVnaW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuXG4gIHJldHVybiB7XG4gICAgYnVpbGQ6IHtcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIHJlYWN0KCksXG4gICAgICB1bm9jc3ModW5vY3NzQ29uZmlnKSxcbiAgICAgIHRzY29uZmlnUGF0aHMoKSxcbiAgICAgIHNlbnRyeVZpdGVQbHVnaW4oe1xuICAgICAgICBvcmc6IFwiY29uc29sZWxhYnNcIixcbiAgICAgICAgcHJvamVjdDogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBcInZlcnNlLXdlYi1wcm9kXCIgOiBcInZlcnNlLXdlYi1kZXZcIixcbiAgICAgICAgaW5jbHVkZTogXCIuL2Rpc3RcIixcbiAgICAgICAgYXV0aFRva2VuOiBlbnYuVklURV9TRU5UUllfQVVUSF9UT0tFTixcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgc2VydmVyOiB7IGhvc3Q6IFwiMC4wLjAuMFwiLCBwb3J0OiA4MDAwIH0sXG4gICAgY2xlYXJTY3JlZW46IGZhbHNlLFxuICB9O1xufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy92aW5jZW50L0Rlc2t0b3Avd29yay9jb25zb2xlbGFicy92ZXJzZS13ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy92aW5jZW50L0Rlc2t0b3Avd29yay9jb25zb2xlbGFicy92ZXJzZS13ZWIvdW5vY3NzLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvdmluY2VudC9EZXNrdG9wL3dvcmsvY29uc29sZWxhYnMvdmVyc2Utd2ViL3Vub2Nzcy5jb25maWcudHNcIjtpbXBvcnQgcHJlc2V0VW5vIGZyb20gXCJAdW5vY3NzL3ByZXNldC11bm9cIjtcbmltcG9ydCBwcmVzZXRJY29ucyBmcm9tIFwiQHVub2Nzcy9wcmVzZXQtaWNvbnNcIjtcbmltcG9ydCB0cmFuc2Zvcm1lclZhcmlhbnRHcm91cCBmcm9tIFwiQHVub2Nzcy90cmFuc2Zvcm1lci12YXJpYW50LWdyb3VwXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidW5vY3NzXCI7XG5cbmNvbnN0IGNvbHMgPSBBcnJheSg1KVxuICAuZmlsbCgwKVxuICAubWFwKChfLCBpKSA9PiBgZ3JpZC1jb2xzLSR7aSArIDF9YClcbiAgLmpvaW4oXCIgXCIpO1xuY29uc3Qgcm93cyA9IEFycmF5KDUpXG4gIC5maWxsKDApXG4gIC5tYXAoKF8sIGkpID0+IGBncmlkLXJvd3MtJHtpICsgMX1gKVxuICAuam9pbihcIiBcIik7XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSBkZWZpbmVDb25maWcoe1xuICBwcmVzZXRzOiBbcHJlc2V0SWNvbnMoKSwgcHJlc2V0VW5vKCldLFxuICB0cmFuc2Zvcm1lcnM6IFt0cmFuc2Zvcm1lclZhcmlhbnRHcm91cCgpXSxcbiAgc2hvcnRjdXRzOiB7XG4gICAgYnRuOiBcInNoYWRvdy1tZCBmbGV4IGl0ZW1zLWNlbnRlciB6LTEwIGRpc2FibGVkOmZpbHRlci1ncmF5c2NhbGUgZGlzYWJsZWQ6b3BhY2l0eS05MCB1cHBlcmNhc2UgZm9udC1zZW1pYm9sZCByb3VuZGVkIGRpc2FibGVkOmhvdmVyOmJyaWdodG5lc3MtMTAwIGhvdmVyOmJyaWdodG5lc3MtMTEwIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTc1IGVhc2UtaW4tb3V0XCIsXG4gICAgXCJidG4tcHJpbWFyeS1ibHVlXCI6IFwiYmctIzE5QThGNSB0ZXh0LXdoaXRlXCIsXG4gICAgXCJidG4tcHJpbWFyeS1waW5rXCI6IFwiYmctI2VmM2ZmZiB0ZXh0LXdoaXRlXCIsXG4gICAgXCJidG4tbGdcIjogXCJ0ZXh0LTJ4bCBweC04IHB5LTJcIixcbiAgICBcImJ0bi1tZFwiOiBcInRleHQtbGcgcHgtNiBweS0xXCIsXG4gICAgXCJidG4tc21cIjogXCJ0ZXh0LWJhc2UgcHgtNCBweS0xXCIsXG4gIH0sXG4gIHNhZmVsaXN0OiBgJHtjb2xzfSAke3Jvd3N9YC5zcGxpdChcIiBcIiksXG4gIHRoZW1lOiB7XG4gICAgY29sb3JzOiB7XG4gICAgICB0eXBvOiB7XG4gICAgICAgIHNlY29uZGFyeTogXCIjQzNFNkZGXCIsXG4gICAgICAgIHRlcnRpYXJ5OiBcIiM3MTgzQTFcIixcbiAgICAgIH0sXG4gICAgICBiYWNrZ3JvdW5kOiB7XG4gICAgICAgIHByaW1hcnk6IFwiIzE1MTMyMVwiLFxuICAgICAgICBzZWNvbmRhcnk6IFwiIzJEMkQ0NVwiLFxuICAgICAgICB0ZXJ0aWFyeTogXCIjMzczNDU4XCIsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVUsU0FBUyxnQkFBQUEsZUFBYyxlQUFlO0FBQzNXLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sV0FBVztBQUNsQixPQUFPLFlBQVk7OztBQ0hzVCxPQUFPLGVBQWU7QUFDL1YsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyw2QkFBNkI7QUFDcEMsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTSxPQUFPLE1BQU0sQ0FBQyxFQUNqQixLQUFLLENBQUMsRUFDTixJQUFJLENBQUMsR0FBRyxNQUFNLGFBQWEsSUFBSSxHQUFHLEVBQ2xDLEtBQUssR0FBRztBQUNYLElBQU0sT0FBTyxNQUFNLENBQUMsRUFDakIsS0FBSyxDQUFDLEVBQ04sSUFBSSxDQUFDLEdBQUcsTUFBTSxhQUFhLElBQUksR0FBRyxFQUNsQyxLQUFLLEdBQUc7QUFFSixJQUFNLFNBQVMsYUFBYTtBQUFBLEVBQ2pDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDO0FBQUEsRUFDcEMsY0FBYyxDQUFDLHdCQUF3QixDQUFDO0FBQUEsRUFDeEMsV0FBVztBQUFBLElBQ1QsS0FBSztBQUFBLElBQ0wsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBLFVBQVUsR0FBRyxRQUFRLE9BQU8sTUFBTSxHQUFHO0FBQUEsRUFDckMsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLFFBQ0osV0FBVztBQUFBLFFBQ1gsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOzs7QURoQ0QsU0FBUyx3QkFBd0I7QUFFakMsSUFBTyxzQkFBUUMsY0FBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFDakQsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRTNDLFNBQU87QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixPQUFPLE1BQVk7QUFBQSxNQUNuQixjQUFjO0FBQUEsTUFDZCxpQkFBaUI7QUFBQSxRQUNmLEtBQUs7QUFBQSxRQUNMLFNBQVMsU0FBUyxlQUFlLG1CQUFtQjtBQUFBLFFBQ3BELFNBQVM7QUFBQSxRQUNULFdBQVcsSUFBSTtBQUFBLE1BQ2pCLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxRQUFRLEVBQUUsTUFBTSxXQUFXLE1BQU0sSUFBSztBQUFBLElBQ3RDLGFBQWE7QUFBQSxFQUNmO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiZGVmaW5lQ29uZmlnIiwgImRlZmluZUNvbmZpZyJdCn0K
