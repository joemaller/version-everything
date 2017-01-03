'use strict';
const path = require('path');
const fs = require('fs');
const sed = require('shelljs').sed;
const jsonfile = require('jsonfile');
const yaml = require('js-yaml')
const xml2js = require('xml2js');
const builder = new xml2js.Builder();

const readPkgUp = require('read-pkg-up').sync;

const getPackageJson = require('./app/get-package-json');
const getVersionFiles = require('./app/get-version-files');


/**
 * Updates the version number in specified files
 * @param  {array or object} config Arrays of filenames will be loaded
 *                                  directly.
 *                                  Objects should contain a files key
 *                                  and an optional package_json key
 * @return {[type]}               [description]
 */
module.exports = function(config) {

  console.log('------------------ in main function ---------------');
  console.log('process.argv', process.argv);

  const pkg = getPackageJson(config)
  const files = getVersionFiles(config, pkg);

  console.log(pkg, files);
  return;

  files.forEach(f => {
    jsonfile.readFile(f, (err, data) => {
      if (err) {
       sed('-i', /^([# ]*Version: *).*/, `$1${ pkg.version }`, f);
      } else  {
        data.version = pkg.version;
        // xml2js.write(f + '.xml', data);
        console.log(builder.buildObject(data));
        fs.writeFileSync(f + '.xml', data);
        jsonfile.writeFileSync(f, data, {spaces: 2});
      }
    });
  });
}