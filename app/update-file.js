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

const writeLogResult = async (result, file, version, config) => {
  if (result) {
    const log = logInit(config.quiet);
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

const defaultOptions = {
  quiet: false,
  dryRun: false,
  json: { space: 2, replacer: null, reviver: null },
  xml: { compact: false, spaces: 2, indentCdata: true },
  yaml: {},
  prefixes: [],
};

const getConfig = (file, version, options) => {
  if (!file) {
    throw new Error("A file argument is required.");
  }
  if (!version) {
    throw new Error("A version argument (string) is required.");
  }

  if (!isPlainObject(options)) {
    throw new Error("Options should be an object.");
  }

  const config = { ...defaultOptions, ...options };
  config.json = { ...defaultOptions.json, ...options.json };
  config.xml = { ...defaultOptions.xml, ...options.xml };

  return config;
};
/**
 * Sends files to the correct bumping function, writes the result
 * @param {String} file    [description]
 * @param {String} version [description]
 * @param {Object} options Config options, quiet, json, xml and yaml
 * @return {Promise<any>}
 */
const updateFile = async (file, version, options = {}) => {
  let result;
  const config = getConfig(file, version, options);

  /**
   * Try all files based on file extension
   * Then try all files as structured data with missing extensions
   * Then try all files as plain-text again
   */
  const data = await fs.readFile(file, "utf8").catch((err) => err);

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

  return writeLogResult(result, file, version, config);
};

/** @type {any} */
module.exports = universalify.fromPromise(updateFile);
