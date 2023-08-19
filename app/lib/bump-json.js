// @ts-check
import sortPackageJson from "sort-package-json";
import bumpPlainText from "./bump-plain-text.js";

export default function (data, version, config) {
  let prefixData = {};
  let hasVersion = false;

  try {
    if (config.prefixes.length > 0) {
      prefixData = bumpPlainText(data, version, config);
      hasVersion = !!prefixData?.data;
    }

    let json = JSON.parse(prefixData.data || data, config.json.reviver);
    const oldVersion = json.version;

    if (!hasVersion) {
      json.version = version;
    }

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
}
