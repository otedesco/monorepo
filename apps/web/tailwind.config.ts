import type { Config } from "tailwindcss";
import uiConfig from "../../packages/ui/tailwind.config";

const config: Config = {
  darkMode: uiConfig.darkMode,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      ...uiConfig.theme?.extend,
    },
  },
  plugins: uiConfig.plugins || [],
};

export default config;

