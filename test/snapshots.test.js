const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const raw = require("jest-snapshot-serializer-raw").wrap;
const updateFile = require("../app/update-file");

/**
 * This file builds a snapshot test for every file in the **test-files**
 * directory. Snapshots are stored in `test/__snapshots__`.
 */

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
