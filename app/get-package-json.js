'use strict';
const path = require('path');
const readPkgUp = require('read-pkg-up').sync;
const loadJsonFile = require('load-json-file');
const semver = require('semver');

/**
 * Mostly just a reporting wrapper for readPkgUp
 * Also handles package.json overrides from the config object
 * @param  {object} config
 *                         package_json: path to a specific package.json file
 *                         quiet - suppress console.log output
 * @return {object}        The loaded, normalized representation of package.json
 */
module.exports = function(config) {
  config = config || {};
  let data;

  if (config.package_json) {
    try {
      let jsonFile = loadJsonFile.sync(config.package_json);
      data = {
        path: config.package_json,
        pkg: jsonFile
      }
    } catch ( err ) {
      throw new Error(`Unable to load ${ config.package_json }  ${ err }`);
    }
  } else {
    data = readPkgUp({normalize: false});
    if (!Object.keys(data).length) throw new Error('Unable to find a package.json file.');
  }
  if (data.pkg && data.pkg.version) data.pkg.version = semver.clean(data.pkg.version);
  if (!data.pkg.version) {
    let relPath = path.relative(process.cwd(), data.path);
    throw new Error(`${relPath} does not contain a valid SemVer version string.`);
  }
  if (!config.quiet) {
    console.log(`Loading package.json from ${ path.relative(process.cwd(), data.path)}`);
    console.log(`Current version is "${ data.pkg.version }"`);
  }
  return data;
}