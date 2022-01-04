// @ts-check
const yaml = require("js-yaml");

/**
 *
 * @param {string} data
 * @param {string} version
 * @param {{yaml: object }} config
 * @returns
 */
module.exports = function (data, version, config) {
  try {
    /** @type {object} */
    const yamlData = yaml.load(data);
    // TODO: Switch this to loadAll(), then iterate component documents.
    //       If multiple results, pass strings to bumpPlainText? Does that get front-matter?
    if (typeof yamlData !== "object") {
      return;
    }
    const oldVersion = yamlData.version;
    yamlData.version = version;
    return {
      oldVersion: oldVersion,
      data: yaml.dump(yamlData, config.yaml),
    };
  } catch (err) {
    // console.log("bumpYAML Error:", err);
    throw err;
  }
};
