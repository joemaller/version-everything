'use strict';

const fs = require('fs');
const path = require('path');
const sed = require('shelljs').sed;
const jsonfile = require('jsonfile');
const yaml = require('js-yaml')
const xml2js = require('xml2js');
const builder = new xml2js.Builder();

const bumpPlainText = function(data) {

};

const bumpJSON = function(data, version, config) {
  try {
    let json = JSON.parse(data);
    console.log(json);
    const oldVersion = json.version;
    json.version = version;
    return {
      oldVersion: oldVersion,
      data: JSON.stringify(json, config.replacer, config.space)
    };
  } catch (err) {
    console.log(err);
  }
}

/**
 * Sends files to the correct bumping function, writes the result
 * @param  {[type]} file    [description]
 * @param  {[type]} version [description]
 * @return {[type]}         [description]
 */
module.exports = function(file, version, options) {
  if (!file) throw new Error('A file argument is required.');
  if (!version) throw new Error('A version argument (string) is required.');
  const defaults = {
    json: {space: 2, replacer: null},
    xml: {},
    yaml: {}
  };
  const config = Object.assign({}, defaults, options);
  // console.log(config);

  // first pass tries file extensions, if those don't match, try parsing
  // the file contents  before falling back to plain-text regex replace
  // console.log(path.extname(file).toLowerCase())

  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    let result;

    switch (path.extname(file).toLowerCase()) {
      case ".json":
        console.log('JSON FILE!', data);
        result = bumpJSON(data, version, config.json);
        console.log(result);
        break;
      case ".xml":
      case ".plist":
        console.log('XML or PLIST FILE!')
        break;
      default:
        console.log('no extension match');
    }
    if (result) {
      console.log(`Updating ${path.relative(file)} from ${result.oldVersion} to ${version}`);
    }
  })
};
