// @ts-check
import { build, parse } from "plist";
import bumpPlainText from "./bump-plain-text.js";

/**
 * @param {string} data
 * @param {string} version
 * @param {{ prefixes: (string | RegExp)[] }} config
 */
export default function (data, version, config) {
  /** @type {{ data?: string } | undefined} */
  let prefixData = {};
  let hasVersion = false;

  if (config.prefixes.length > 0) {
    prefixData = bumpPlainText(data, version, config);
    hasVersion = !!prefixData?.data;
  }

  let plistData;
  try {
    plistData = parse(prefixData?.data || data);
  } catch (err) {
    throw new Error("Unable to parse plist", { cause: err });
  }

  if (
    !plistData ||
    typeof plistData !== "object" ||
    Array.isArray(plistData) ||
    plistData instanceof Date ||
    plistData instanceof Uint8Array
  ) {
    throw new Error("Unable to parse plist");
  }

  const oldVersion = plistData.Version;

  if (!hasVersion) {
    plistData.Version = version;
  }

  return {
    oldVersion: oldVersion,
    data: build(plistData),
  };
}
