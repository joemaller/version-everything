'use strict';

const fs = require('fs-extra');
const tmp = require('tmp');

tmp.setGracefulCleanup();

/**
 * Copies a directory (fixture) to a temp directory and returns
 * that directory
 * @param  {string} fixtureDir path to directory to copy
 * @return {[type]}            [description]
 */
module.exports = function(fixtureDir) {
  const tmpDir = tmp.dirSync({unsafeCleanup: true}).name;
  fs.copySync(fixtureDir, tmpDir);
  return tmpDir;
};
