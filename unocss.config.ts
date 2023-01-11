import presetUno from "@unocss/preset-uno";
import transformerVariantGroup from "@unocss/transformer-variant-group";
import { defineConfig } from "unocss";

export const config = defineConfig({
  presets: [presetUno()],
  transformers: [transformerVariantGroup()],
  shortcuts: {
    "btn-control":
      "w-24 h-24 bg-transparent border-none hover:(brightness-150 scale-110) transition-all disabled:(pointer-events-none brightness-50)",
  },
  theme: {
    colors: {
      background: {
        primary: "#151321",
        secondary: "#2D2D45",
        tertiary: "#373458",
      },
    },
  },
});
