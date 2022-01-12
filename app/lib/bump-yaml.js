// @ts-check
const YAML = require("yaml");

const bumpPlainText = require("./bump-plain-text");

/**
 *
 * @param {string} data
 * @param {string} version
 * @param {{yaml: object, prefixes: [] }} config
 * @returns
 */
module.exports = function (data, version, config) {
  let prefixData = {};
  let hasVersion = false;

  if (config.prefixes.length > 0) {
    prefixData = bumpPlainText(data, version, config);
    hasVersion = !!prefixData?.data;
  }

  /** @type {object} */
  const yamlObj = YAML.parse(prefixData.data || data);

  // TODO: Does this also need to check for Arrays and Strings?
  if (yamlObj === null) {
    throw "YAML.parse() returned null";
  }

  const yamlData = YAML.parseDocument(prefixData?.data || data, config.yaml);
  const oldVersion = yamlData.get("version") || prefixData?.oldVersion;

  if (!hasVersion) {
    yamlData.set("version", version);
  }

  return {
    oldVersion: oldVersion,
    data: yamlData.toString(config.yaml),
  };
};
