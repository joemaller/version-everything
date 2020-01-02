const fs = require("fs-extra");
const glob = require("globby");
/**
 * Since the main purpose of this library is to update files,
 * the tests should be a directory of files.
 *
 * Each of those files would be tested and compared to the snapshots.
 */

files = glob(["snapshots/**"]);

describe("Snapshot tests", () => {
  test.skip("test snapshots", () => {});
});
