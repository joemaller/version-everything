import fs from "fs-extra";
import path from "path";
import { readPackageUpSync } from "read-pkg-up";
import semver from "semver";
import logInit from "./lib/log-init.js";

/**
 * Mostly just a reporting wrapper for readPkgUp
 * Also handles package.json overrides from the config object
 * @param  {object} config
 *                         package_json: path to a specific package.json file
 *                         quiet - suppress console.log output
 * @return {object}        The loaded, normalized representation of package.json
 */
export default (config = {}) => {
  const log = logInit(config.quiet);
  let data;

  if (config.packageJson) {
    try {
      const packageJson = fs.readJsonSync(config.packageJson);
      data = { path: config.packageJson, packageJson };
    } catch (err) {
      throw new Error(`Unable to load ${config.packageJson}  ${err}`);
    }
  } else {
    data = readPackageUpSync({ normalize: false });
    if (!data || !Object.keys(data).length) {
      throw new Error("Unable to find a package.json file.");
    }
  }

  // data.packageJson.version = semver.clean(data.packageJson.version || "");

  // if (data.packageJson.version === null) {
  //   let relPath = path.relative(process.cwd(), data.path);
  //   throw new Error(
  //     `${relPath} does not contain a valid SemVer version string.`
  //   );
  // }

  log(`Loading ${path.relative(process.cwd(), data.path)}`);
  // log(`Current version is "${data.packageJson.version}"`);

  // console.log({ data });

  return data;
};
