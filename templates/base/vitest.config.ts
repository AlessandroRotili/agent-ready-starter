import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "services/*-service.ts",
        "lib/media/variants.ts",
        "lib/http/security.ts",
      ],
      thresholds: { lines: 90, functions: 90, branches: 80, statements: 90 },
    },
  },
});
