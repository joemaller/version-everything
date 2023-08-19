import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    threads: false,
    coverage: {
      enabled: true,
      reportOnFailure: true,
      reporter: ["lcov", "clover", "json", "text"],
    },
  },
});
