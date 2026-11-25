// @ts-check

import { describe, expect, test } from "vitest";

import updateFile from "../app/update-file.js";

/**
 * This is testing a problem discovered with https://github.com/ideasonpurpose/docker-phpunit-watch
 * where the bump-phpunit.sh script was being re-wrapped when the version was updated.
 */
describe("Shell script re-wrapping with prefix", () => {
  const newVersion = "1.414.213";

  test("valid shell script: no prefix", async () => {
    const result = await updateFile(
      "./test/snapshots/valid-yaml-shell-script.sh",
      newVersion,
      { dryRun: true, quiet: true, prefixes: [] },
    );
    await expect(result?.data).toMatchFileSnapshot(
      "./__snapshots__/valid-yaml-shell-script__no-prefix.sh",
    );
  });

  test("valid shell script: prefix", async () => {
    const result = await updateFile(
      "./test/snapshots/valid-yaml-shell-script.sh",
      newVersion,
      { dryRun: true, quiet: true, prefixes: ["prefix"] },
    );
    await expect(result?.data).toMatchFileSnapshot(
      "./__snapshots__/valid-yaml-shell-script__prefix.sh",
    );
  });
});
