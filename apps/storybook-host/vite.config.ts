import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@domain": path.resolve(__dirname, "../../packages/domain/src"),
      "@api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});

