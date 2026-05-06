import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      exclude: ["node_modules/", ".next/", "tests/", "e2e/", "*.config.*", "sentry.*.config.ts", "next-env.d.ts"],
      thresholds: {
        lines: 5,
        functions: 5,
        branches: 30,
        statements: 5,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
