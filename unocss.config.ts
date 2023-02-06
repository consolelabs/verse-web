import presetUno from "@unocss/preset-uno";
import presetIcons from "@unocss/preset-icons";
import transformerVariantGroup from "@unocss/transformer-variant-group";
import { defineConfig } from "unocss";

const cols = Array(5)
  .fill(0)
  .map((_, i) => `grid-cols-${i + 1}`)
  .join(" ");
const rows = Array(5)
  .fill(0)
  .map((_, i) => `grid-rows-${i + 1}`)
  .join(" ");

export const config = defineConfig({
  presets: [presetIcons(), presetUno()],
  transformers: [transformerVariantGroup()],
  shortcuts: {
    btn: "shadow-md flex items-center z-10 disabled:filter-grayscale disabled:opacity-90 uppercase font-semibold rounded disabled:hover:brightness-100 hover:brightness-110 transition-all duration-75 ease-in-out",
    "btn-primary-blue": "bg-#19A8F5 text-white",
    "btn-primary-pink": "bg-#ef3fff text-white",
    "btn-lg": "text-2xl px-8 py-2",
    "btn-md": "text-lg px-6 py-1",
    "btn-sm": "text-base px-4 py-1",
  },
  safelist: `${cols} ${rows}`.split(" "),
  theme: {
    colors: {
      typo: {
        secondary: "#C3E6FF",
        tertiary: "#7183A1",
      },
      background: {
        primary: "#151321",
        secondary: "#2D2D45",
        tertiary: "#373458",
      },
    },
  },
});
