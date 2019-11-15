const readPkgUp = require("read-pkg-up");

const getVersionFiles = require("./app/get-version-files");
const updateFile = require("./app/update-file");

/**
 * The version-everything object should contain a files array and an optional options object
 *
 * "version-everything": {
 *   files: ["file1.js", "file2.json"],
 *   options: {
 *      quiet: false
 *   }
 * }
 *
 */

/**
 * Updates the version number in specified files
 * @param  {array, string or object} args An array of files, a single filename or an
 *                                        object representation of a package.json file.
 */
module.exports = function(args) {
  const { packageJson } = readPkgUp.sync();
  const version = args.version || packageJson.version;
  const options =
    (args["version-everything"] && args["version-everything"].options) || {};

  getVersionFiles(args).forEach(f => updateFile(f, version, options));
};
