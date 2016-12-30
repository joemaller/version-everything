const path = require('path');
const readPkgUp = require('read-pkg-up').sync;
const loadJsonFile = require('load-json-file');
const normalizePkg = require('normalize-package-data');

/**
 * Mostly just a reporting wrapper for readPkgUp
 * Also handles package.json overrides from the config object
 * @param  {object} config May contain a path to a different package.json file (or equivalent)
 * @return {object}        The loaded, normalized representation of package.json
 */
module.exports = function(config) {
  let pkg;

  if (!config.package_json) {
    pkg = readPkgUp();
  } else {
    try {
      let jsonFile = normalizePkg(loadJsonFile(config.package_json));
      pkg = {
        path: config.package_json,
        pkg: jsonFile
      }
    } catch (err) {
      console.error(`Unable to load ${config.package_json}`);
      throw err;
    }
  }
  console.log(`Loading package.json from ${ path.relative(process.cwd(), pkg.path) }`);
  console.log(`Current version is "${ pkg.pkg.version }"`);
  return pkg;
}
