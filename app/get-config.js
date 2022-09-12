// @ts-check
import path from "path";

const getConfig = (yargsObject = { _: [] }) => {
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

  console.log({yargsObject, config});
  return config;
};
export default getConfig;
