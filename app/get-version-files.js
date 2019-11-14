"use strict";

// const findUp = require("find-up").sync;
const { cosmiconfigSync } = require("cosmiconfig");

/**
 * Returns an array of files to version
 * If files is empty, check for the following, in order:
 *     1. a .version-everything.js file which is a sibling to package.json
 *     2. a 'version-everything.files' array in package.json
 * @param  {object, array, string} config list of filenames, object containing a list or a filename
 * @param  {object} pkg    {pkg: <package.json object>, path: process.cwd()} path will be the
 * @return {array}        List of files to version
 */
module.exports = function(args) {
  if (arguments.length) {
    if (args) {
      let files = [];
      if (args && args["version-everything"]) {
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
    }
  }
  return [];
};
