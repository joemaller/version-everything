// @ts-check
import { readPackageUpSync } from "read-package-up";
import { cosmiconfigSync } from "cosmiconfig";
import semver from "semver";

import updateFile from "./app/update-file.js";
import getPackageJson from "./app/get-package-json.js";
import logInit from "./app/lib/log-init.js";

/**
 * The args object should contain a files array any other documented options
 *
 * "{
 *   files: ["file1.js", "file2.json"],
 *   prefix: ['namespace/img:'],
 *   quiet: false,
 *   json: {space: 4}
 * }
 */

/**
 * Updates the version number in specified files
 * @param  {object | false} args An array of files, a single filename or an
 * object representation of a package.json file. May also be `false`, in which
 * case the function should return silently.
 */
export default function (args = {}) {
  if (args === false) {
    return;
  }
  /**
   * If packageJson is specified in args, use that or fail if it can't be loaded
   * Otherwise find the closest package.json file as always
   */
  let data;
  if (args.packageJson) {
    data = getPackageJson(args);
  } else {
    data = readPackageUpSync({ normalize: false });
  }

  const { path, packageJson } = data;

  const explorerSync = cosmiconfigSync("version-everything", {
    searchStrategy: "project",
  });
  const configFile = explorerSync.search(path) || { config: {} };
  const options = { ...configFile.config, ...args };
  const log = logInit(options.quiet);

  const version = semver.clean(args.version || packageJson.version || "");
  if (!version) {
    throw "No valid SemVer version string found.";
  }
  log(`Current version is "${data.packageJson.version}"`);

  // TODO: Default empty array could be provided by a default-config file
  options.prefixes = options?.prefixes || [];
  if (typeof options.prefixes === "string") {
    options.prefixes = [options.prefixes];
  }

  if (options.prefix) {
    if (typeof options.prefix === "string") {
      options.prefix = [options.prefix];
    }
    options.prefixes = [...options.prefix, ...options.prefixes];
    delete options.prefix;
  }

  /**
   * @type {string[]}
   * TODO: Default empty array could be provided by a default-config file
   */
  const versionFiles = options?.files || [];
  delete options.files;

  // Remove unneeded properties
  delete options.version;
  delete options.config;

  versionFiles.map((f) => updateFile(f, version, options));
  Promise.all(versionFiles);
}
