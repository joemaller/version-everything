"use strict";
const getPackageJson = require("./app/get-package-json");
const getVersionFiles = require("./app/get-version-files");
const updateFile = require("./app/update-file");

/**
 * Updates the version number in specified files
 * @param  {array or object} config Arrays of filenames will be loaded
 *                                  directly.
 *                                  Objects should contain a files key
 *                                  and an optional package_json key
 * @return {[type]}               [description]
 */
module.exports = function(config) {
  const packageJson = getPackageJson(config);
  getVersionFiles(config, packageJson).forEach(f =>
    updateFile(f, packageJson.pkg.version, config)
  );
};
