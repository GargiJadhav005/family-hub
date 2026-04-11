import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
    testTimeout: 30000, // 30s for integration tests hitting live DB
    reporters: ["verbose"],
    coverage: {
      provider: "v8",
      include: ["src/controllers/**", "src/utils/**", "src/middleware/**"],
      reporter: ["text", "lcov"],
    },
  },
});
