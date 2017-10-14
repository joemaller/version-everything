"use strict";

const yaml = require("js-yaml");

module.exports = function(data, version, config) {
  try {
    const yamlData = yaml.safeLoad(data);
    const oldVersion = yamlData.version;
    yamlData.version = version;
    return {
      oldVersion: oldVersion,
      data: yaml.safeDump(yamlData, config)
    };
  } catch (err) {
    // console.log('bumpJSON Error:', err);
    throw err;
  }
};
