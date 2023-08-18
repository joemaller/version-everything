// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";
import { glob } from "glob";
import updateFile from "../app/update-file.js";

/**
 * Run a snapshot test for every file in .test/snapshots.
 * Corresponding result snapshots are in ./test/__snapshots__
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = glob.sync("**/*", {
  cwd: path.resolve(__dirname, "snapshots"),
  nodir: true,
  absolute: true,
});

describe("Snapshot Tests:", () => {
  const newVersion = "1.414.213";

  testFiles.forEach((file) => {
    // console.log(file);
    test(path.basename(file), () => {
      const src = fs.readFileSync(file).toString();

      return updateFile(file, newVersion, { dryRun: true, quiet: true }).then(
        (result) => {
          result = result || {};
          result.data = result.data || src;
          expect(result.data).toMatchFileSnapshot(
            `./__snapshots__/${path.basename(file)}`
          );
        }
      );
    });
  });
});

describe("Shell script re-wrapping with prefix", () => {
  const newVersion = "1.6.18";

  /**
   * This is testing a problem discovered with https://github.com/ideasonpurpose/docker-phpunit-watch
   * where the bump-phpunit.sh script was being re-wrapped when the version was updated.
   */
  test("re-wrapped shell script", async () => {
    const result = await updateFile("./test/snapshots/prefix/bump-phpunit.sh", newVersion, {dryRun: true, prefixes: ['hello']});
    console.log(result);
    expect(result?.data).toMatchFileSnapshot(
      "./__snapshots__/prefix/bump-phpunit.sh"
    );
  });
});
