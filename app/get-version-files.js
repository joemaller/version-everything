'use strict';

const findUp = require('find-up').sync;

/**
 * Returns an array of files to version
 * If files is empty, check for the following, in order:
 *     1. a .version-everything.js file which is a sibling to package.json
 *     2. a 'version_files' array in package.json
 * @param  {object, array, string} config list of filenames, object containing a list or a filename
 * @param  {object} pkg    an object containing a pkg and path
 * @return {array}        List of files to version
 */
module.exports = function(config, pkg) {
  const packageJson = pkg || { path: process.cwd() };
  let files = (config && config.files) ? config.files : config;
  if (Array.isArray(files) && files.length) return files;
  if (typeof files === 'string') return [files];

  try {
    let pkgdir = findUp('.version-everything.js', { cwd: packageJson.path });
    return require(pkgdir).files;
  } catch (err) {
    if (packageJson.pkg) {
      return packageJson.pkg.version_files || [];
    }
    return [];
  }
};
