// @ts-check

import fs from "fs-extra";
import path from "path";

import universalify from "universalify";
import chalk from "chalk";
import isPlainObject from "lodash.isplainobject";

import logInit from "./lib/log-init.js";

import bumpPlainText from "./lib/bump-plain-text.js";
import bumpJSON from "./lib/bump-json.js";
import bumpYAML from "./lib/bump-yaml.js";
import bumpPlist from "./lib/bump-plist.js";
import bumpXML from "./lib/bump-xml.js";

import extensions from "./extension-map.js";

const writeLogResult = async (result, file, version, config) => {
  if (!result) {
    return;
  }

  const log = logInit(config.quiet);

  if (result.errno && result.code) {
    log(`⚠️ Could not update ${chalk.magenta(path.basename(file))}
      ${chalk.red.bold(result.toString())}`);
    return;
  }

  let updateMsg =
    `Updated ${chalk.magenta(path.basename(file))} ` +
    `from ${chalk.gray(result.oldVersion)} ` +
    `to ${chalk.cyan(version)}`;

  if (!config.dryRun) {
    try {
      await fs.writeFile(file, result.data);
    } catch (err) {
      throw err;
    }
  } else {
    updateMsg = updateMsg.replace(
      /^Updated/g,
      chalk.gray("[dry run]") + " Not updating"
    );
  }

  log(updateMsg);

  return result;
};

const defaultOptions = {
  quiet: false,
  dryRun: false,
  json: { space: 2, replacer: null, reviver: null },
  xml: { compact: false, spaces: 2, indentCdata: true },
  yaml: { nullStr: "" },
  prefixes: [],
};

/**
 * @param {String} file
 * @param {String} version
 * @param {Object} options
 * @returns
 */
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
  config.yml = { ...defaultOptions.yml, ...options.yml };

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
    return writeLogResult(data, file, version, config);
  }
  const ext = path.extname(file).toLowerCase().slice(1);

  switch (true) {
    case extensions.json.includes(ext):
      result = bumpJSON(data, version, config);
      break;

    case extensions.xml.includes(ext):
      result = bumpXML(data, version, config);
      break;

    case extensions.plist.includes(ext):
      result = bumpPlist(data, version, config);
      break;

    case extensions.yaml.includes(ext):
      result = bumpYAML(data, version, config);
      break;

    case extensions.text.includes(ext):
      result = bumpPlainText(data, version, config);
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
        // TODO: Based on #40 and how permissive YAML is, is this a bad idea?
        // @link https://github.com/joemaller/version-everything/issues/40
        try {
          result = bumpYAML(data, version, config);
        } catch (error) {}
      }
      if (!result) {
        // No result, trying file as plain text (RegExp)
        result = bumpPlainText(data, version, config);
      }
  }

  return writeLogResult(result, file, version, config);
};

export default universalify.fromPromise(updateFile);
