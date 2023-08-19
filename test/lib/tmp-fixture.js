import fs from "fs-extra";
import tmp from "tmp";

/**
 * Copies a directory (fixture) to a temp directory and returns
 * that directory
 * @param  {string} fixtureDir path to directory to copy
 * @return {string}            path of the temp directory
 */
export default (fixtureDir) => {
  const tmpDir = tmp.dirSync({ keep: true }).name;
  fs.copySync(fixtureDir, tmpDir);
  return tmpDir;
};
