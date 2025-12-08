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
      "@ui": path.resolve(__dirname, "../ui/src"),
      "@domain": path.resolve(__dirname, "../domain/src"),
      "@api-client": path.resolve(__dirname, "../api-client/src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
    },
  },
});

