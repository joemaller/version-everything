"use strict";
const path = require("path");
const fs = require("fs-extra");
const readPkgUp = require("read-pkg-up").sync;
const semver = require("semver");
const logInit = require("./lib/log-init");

/**
 * Mostly just a reporting wrapper for readPkgUp
 * Also handles package.json overrides from the config object
 * @param  {object} config
 *                         package_json: path to a specific package.json file
 *                         quiet - suppress console.log output
 * @return {object}        The loaded, normalized representation of package.json
 */
module.exports = function(args) {
  const config = args || {};
  const log = logInit(config.quiet);
  let data;

  if (config.package_json) {
    try {
      let jsonFile = fs.readJsonSync(config.package_json);
      data = {
        path: config.package_json,
        packageJson: jsonFile
      };
    } catch (err) {
      throw new Error(`Unable to load ${config.package_json}  ${err}`);
    }
  } else {
    data = readPkgUp({ normalize: false });
    if (!data || !Object.keys(data).length)
      throw new Error("Unable to find a package.json file.");
  }

  if (data.packageJson && data.packageJson.version)
    data.packageJson.version = semver.clean(data.packageJson.version);
  if (!data.packageJson.version) {
    let relPath = path.relative(process.cwd(), data.path);
    throw new Error(
      `${relPath} does not contain a valid SemVer version string.`
    );
  }

  log(`Loading ${path.relative(process.cwd(), data.path)}`);
  log(`Current version is "${data.packageJson.version}"`);

  return data;
};
