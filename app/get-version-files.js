"use strict";

const readPkgUp = require("read-pkg-up");
const { cosmiconfigSync } = require("cosmiconfig");

/**
 * Returns an array of files to version
 * @param  {array, object, string} args an array of filenames, an object representing a package.json file
 *                                      or an object containing a version-everything.files or files array
 *                                      or a string reprenting a filepath. Input isn't validated.
 * @return {array} List of files to version
 */
module.exports = function(args) {
  if (arguments.length) {
    if (args) {
      let files = [];
      if (args["version-everything"]) {
        files = args["version-everything"].files || args;
      } else {
        files = args.files ? args.files : args;
      }
      if (Array.isArray(files) && files.length) return files;
      if (typeof files === "string") return [files];
    }
  } else {
    const explorerSync = cosmiconfigSync("version-everything");
    const configFile = explorerSync.search();

    if (configFile && configFile.config) {
      return configFile.config.files || [];
    } else {
      const pkg = readPkgUp.sync();
      if (pkg) {
        const { packageJson } = pkg;
        return packageJson.version_files || packageJson.versionFiles || [];
      }
    }
  }
  return [];
};
