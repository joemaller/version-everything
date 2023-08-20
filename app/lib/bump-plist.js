// @ts-check
import plist from "plist";
import bumpPlainText from "./bump-plain-text.js";

export default function (data, version, config) {
  let prefixData = {};
  let hasVersion = false;

  try {
    if (config.prefixes.length > 0) {
      prefixData = bumpPlainText(data, version, config);
      hasVersion = !!prefixData?.data;
    }

    let plistData = plist.parse(prefixData.data || data);

    if (plistData.length == 0) {
      throw "Unable to parse plist";
    }

    const oldVersion = plistData.Version;

    if (!hasVersion) {
      plistData.Version = version;
    }

    return {
      oldVersion: oldVersion,
      data: plist.build(plistData),
    };
  } catch (err) {
    throw err;
  }
}
