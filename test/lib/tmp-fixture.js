const fs = require("fs-extra");
const tmp = require("tmp");

/**
 * Copies a directory (fixture) to a temp directory and returns
 * that directory
 * @param  {string} fixtureDir path to directory to copy
 * @return {string}            path of the temp directory
 */
module.exports = (fixtureDir) => {
  const tmpDir = tmp.dirSync({ keep: true }).name;
  fs.copySync(fixtureDir, tmpDir);
  return tmpDir;
};
