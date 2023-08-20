// @ts-check

import { describe, expect, test } from "vitest";

import { fileURLToPath } from "url";
import path from "path";
import { readFile } from "fs/promises";
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
    test(path.basename(file), async () => {
      const src = (await readFile(file)).toString();

      let result = await updateFile(file, newVersion, {
        dryRun: true,
        quiet: true,
      });
      result = result || {};
      result.data = result.data || src;
      expect(result.data).toMatchFileSnapshot(
        `./__snapshots__/${path.basename(file)}`
      );
    });
  });
});
