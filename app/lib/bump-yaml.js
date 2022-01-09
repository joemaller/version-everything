// @ts-check
const yaml = require("js-yaml");
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

  try {
    if (config.prefixes.length > 0) {
      prefixData = bumpPlainText(data, version, config);
      hasVersion = !!prefixData?.data;
    }

    /** @type {object} */
    const yamlData = yaml.load(prefixData?.data || data);
    // TODO: Switch this to loadAll(), then iterate component documents.
    //       If multiple results, pass strings to bumpPlainText? Does that get front-matter?
    if (typeof yamlData !== "object") {
      return;
    }
    const oldVersion = yamlData.version;

    if (!hasVersion) {
      yamlData.version = version;
    }

    return {
      oldVersion: oldVersion,
      data: yaml.dump(yamlData, config.yaml),
    };
  } catch (err) {
    // console.log("bumpYAML Error:", err);
    throw err;
  }
};
