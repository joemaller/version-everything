'use strict';

const fs = require('fs-extra');
const path = require('path');
// const Promise = require("bluebird");
// const readFile = Promise.promisify(fs.readFile);
const chalk = require('chalk');
const sed = require('shelljs').sed;
const yaml = require('js-yaml');
const xml2js = require('xml2js');
const builder = new xml2js.Builder();

/**
 * Simple conditional wrapper for console.log
 * Honest question. Did I just curry console.log?
 * @param  {boolean} quiet  switch to enable logging
 * @return {function}       console.log or a noop
 */
const logInit = function(quiet) {
  return (quiet) ? ()=>{} : console.log;
};

const bumpPlainText = function(data) {
  console.log(data);
};


const bumpJSON = require('./lib/bumpJSON');

/**
 * Sends files to the correct bumping function, writes the result
 * @param  {[type]} file    [description]
 * @param  {[type]} version [description]
 * @param {object} options Config options, quiet, json, xml and yaml
 * @param {[function]} cb   standard node callback mostly used for testing
 */
module.exports = function(file, version, options, cb) {
  if (!file) throw new Error('A file argument is required.');
  if (!version) throw new Error('A version argument (string) is required.');
  const defaults = {
    quiet: false,
    json: {space: 2, replacer: null, reviver: null},
    xml: {},
    yaml: {}
  };

  const config = Object.assign({}, defaults, options);
  const log = logInit(config.quiet);

  // first pass tries file extensions, if those don't match, try parsing
  // the file contents before falling back to plain-text regex replace
  // console.log(path.extname(file).toLowerCase())

  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    let result = false;

    switch (path.extname(file).toLowerCase()) {
    case '.json':
      result = bumpJSON(data, version, config.json);
      break;
    case '.xml':
    case '.plist':
      // XML or PLIST FILE!
      break;
    case '.yml':
    case '.yaml':
      // YAML FILE!
      break;
    default:
      // no extension match
      // trying file as unmarked JSON
      result = bumpJSON(data, version, config.json);
      if (!result) {
        // No result, trying file as XML
      }
      if (!result) {
        // No result, trying file as YAML
      }
      if (!result) {
        // No result, trying file as plain text (RegExp)
      }
    }
    if (result) {
      fs.writeFile(file, result.data, (err) => {
        // const cwdfix = process.cwd().replace(/\/private\/var\//, '/var/');
        // const relFile = path.relative(cwdfix, file);
        log(`Updated ${chalk.yellow(file)} from ${chalk.gray(result.oldVersion)} to ${chalk.green(version)}`);
        cb(err, result);
      });
    } else {
      if (cb && typeof cb === 'function') {
        cb(err);
      }
    }
  });
};
