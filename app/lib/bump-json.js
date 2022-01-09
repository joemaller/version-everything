// @ts-check
const sortPackageJson = require("sort-package-json");

module.exports = function (data, version, config) {
  try {
    let json = JSON.parse(data, config.json.reviver);
    const oldVersion = json.version;
    json.version = version;

    if (config.json.sort) {
      json = sortPackageJson(json);
    }

    return {
      oldVersion: oldVersion,
      data: JSON.stringify(json, config.json.replacer, config.json.space),
    };
  } catch (err) {
    // console.log('bumpJSON Error:', err);
    throw err;
  }
};
