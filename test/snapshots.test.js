import { jest } from "@jest/globals";
jest.useFakeTimers();

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";
import { glob } from "glob";
import { wrap as raw } from "jest-snapshot-serializer-raw";
import updateFile from "../app/update-file.js";

/**
 * This file builds a snapshot test for every file in the **test-files**
 * directory. Snapshots are stored in `test/__snapshots__`.
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
    test(path.basename(file), () => {
      const src = fs.readFileSync(file).toString();

      return updateFile(file, newVersion, { dryRun: true, quiet: true }).then(
        (result) => {
          result = result || {};
          result.data = result.data || src;
          expect(raw(createSnapshot(src, result.data))).toMatchSnapshot();
          // done();
        }
      );

      // updateFile(file, newVersion, { dryRun: true }, (err, result) => {
      //   result = result || {};
      //   result.data = result.data || src;
      //   expect(raw(createSnapshot(src, result.data))).toMatchSnapshot();
      //   done();
      // });
    });
  });
});

function separator(width, title) {
  title = title || "";
  const leftLen = Math.floor((width - title.length) / 2);
  const rightLen = width - leftLen - title.length;
  return `${"=".repeat(leftLen)} ${title} ${"=".repeat(rightLen)}`;
}

function createSnapshot(input, output, options) {
  const width = 80;
  return [
    separator(width, "input"),
    input,
    separator(width, "output"),
    output,
  ].join("\n");
}
