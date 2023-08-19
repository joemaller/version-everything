// @ts-check
import path from "path";

const getConfig = (yargsObject = { _: [] }) => {
  if (yargsObject.v) {
    return false;
  }

  let config = {};

  if (yargsObject.packageJson) {
    config.packageJson = path.resolve(yargsObject.packageJson);
  }
  if (yargsObject._.length) {
    config.files = yargsObject._;
  }
  if (yargsObject.quiet) {
    config.quiet = yargsObject.quiet;
  }
  if (yargsObject["dry-run"]) {
    config.dryRun = yargsObject["dry-run"];
  }
  if (yargsObject.prefix) {
    config.prefixes = yargsObject.prefix;
  }

  return config;
};
export default getConfig;
