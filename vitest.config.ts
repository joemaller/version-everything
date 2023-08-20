import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    threads: false,
    coverage: {
      enabled: true,
      reportOnFailure: true,
      reporter: ["lcov", "clover", "json", "text"],
    },
    // This project doesn't use a bundler, so disable
    // deps.interopDefault. See note at the end of docs:
    // @link https://vitest.dev/config/#deps-interopdefault
    deps: {
      interopDefault: false,
    },
  },
});
