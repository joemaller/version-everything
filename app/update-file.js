// @ts-check
"use strict";

const fs = require("fs-extra");
const path = require("path");

const universalify = require("universalify");
const chalk = require("chalk");
const isPlainObject = require("lodash.isplainobject");

const logInit = require("./lib/log-init");

const bumpPlainText = require("./lib/bump-plain-text");
const bumpJSON = require("./lib/bump-json");
const bumpYAML = require("./lib/bump-yaml");
const bumpXML = require("./lib/bump-xml");

/**
 * Sends files to the correct bumping function, writes the result
 * @param {String} file    [description]
 * @param {String} version [description]
 * @param {Object} options Config options, quiet, json, xml and yaml
 * @return {Promise<any>}
 */
const updateFile = async (file, version, options = {}) => {
  if (!file) {
    throw new Error("A file argument is required.");
  }
  if (!version) {
    throw new Error("A version argument (string) is required.");
  }

  if (!isPlainObject(options)) {
    throw new Error("Options should be an object.");
  }

  const defaultOptions = {
    quiet: false,
    dryRun: false,
    json: { space: 2, replacer: null, reviver: null },
    xml: { compact: false, spaces: 2, indentCdata: true },
    yaml: {},
    prefixes: [],
  };

  const config = { ...defaultOptions, ...options };
  const log = logInit(config.quiet);

  // first pass tries file extensions, if those don't match, try parsing
  // the file contents before falling back to plain-text regex replace
  // console.log(path.extname(file).toLowerCase())

  const data = await fs.readFile(file, "utf8").catch((err) => err);

  let result;
  if (data.errno && data.code) {
    result = data;
  } else {
    switch (path.extname(file).toLowerCase()) {
      case ".json":
        result = bumpJSON(data, version, config);
        break;

      case ".xml":
        result = bumpXML(data, version, config);
        break;

      // TODO: Handle PLIST files separately from XML
      // case ".plist":

      case ".yml":
      case ".yaml":
        result = bumpYAML(data, version, config);
        break;

      default:
        // no extension match
        // trying file as unmarked JSON
        try {
          result = bumpJSON(data, version, config);
        } catch (err) {}
        if (!result) {
          // No result, trying file as XML
          try {
            result = bumpXML(data, version, config);
          } catch (error) {}
        }
        if (!result) {
          // No result, trying file as YAML
          try {
            result = bumpYAML(data, version, config);
          } catch (error) {}
        }
        if (!result) {
          // No result, trying file as plain text (RegExp)
          result = bumpPlainText(data, version, config);
        }
    }
  }

  if (result) {
    let updateMsg;

    if (result.errno && result.code) {
      updateMsg = [
        "⚠️ Could not update",
        chalk.magenta(path.basename(file)),
        "\n",
        chalk.red.bold(result.toString()),
      ];
    } else {
      updateMsg = [
        "Updated",
        chalk.magenta(path.basename(file)),
        "from",
        chalk.gray(result.oldVersion),
        "to",
        chalk.cyan(version),
      ];

      if (config.dryRun) {
        updateMsg[0] = chalk.gray("[dry run]") + " Not updating";
      }

      if (!config.dryRun) {
        try {
          await fs.writeFile(file, result.data);
        } catch (err) {
          throw err;
        }
      }
    }
    log(updateMsg.join(" "));
  }
  return result;
};

/** @type {any} */
module.exports = universalify.fromPromise(updateFile);
