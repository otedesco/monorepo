import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["../../vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@domain": path.resolve(__dirname, "../../packages/domain/src"),
      "@api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});

