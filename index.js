// @ts-check
"use strict";

const readPkgUp = require("read-pkg-up");

const { cosmiconfigSync } = require("cosmiconfig");

// const getVersionFiles = require("./app/get-version-files");
const updateFile = require("./app/update-file");

/**
 * The args object should contain a files array any other documented options
 *
 * "{
 *   files: ["file1.js", "file2.json"],
 *   prefix: ['namespace/img:'],
 *   quiet: false,
 *   json: {space: 4}
 * }
 *
 */

/**
 * Updates the version number in specified files
 * @param  {string[] | string | object} args An array of files, a single filename or an
 *                                        object representation of a package.json file.
 */
module.exports = function (args = {}) {
  const { packageJson } = readPkgUp.sync({ normalize: false });
  const version = args.version || packageJson.version;
  if (!version) {
    throw "No version found in args or package.json";
  }

  const searchFrom = args._searchFrom || process.cwd();
  const explorerSync = cosmiconfigSync("version-everything");
  const configFile = explorerSync.search(searchFrom) || { config: {} };

  const options = { ...configFile.config, ...args };

  if (options.prefix) {
    if (typeof options.prefix === "string") {
      options.prefix = [options.prefix];
    }
    options.prefixes = options.prefixes || [];
    options.prefixes = [...options.prefix, ...options.prefixes];
    delete options.prefix;
    delete options.config;
  }
  const versionFiles = options?.files || [];
  delete options.files;

  versionFiles.forEach((f) => updateFile(f, version, options));
};
