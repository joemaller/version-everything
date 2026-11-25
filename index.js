// @ts-check
import { readPackageUpSync } from "read-package-up";
import { cosmiconfigSync } from "cosmiconfig";
import semver from "semver";
import { glob, hasMagic } from "glob";

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

  /**
   * A config file which exports a bare array is treated as a list of files.
   * @link https://github.com/joemaller/version-everything/issues/3
   */
  if (Array.isArray(configFile.config)) {
    configFile.config = { files: configFile.config };
  }

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
   * Expand any glob patterns in the files list. Plain filenames pass through
   * unchanged so missing files still report an error from updateFile.
   * @link https://github.com/joemaller/version-everything/issues/34
   * @type {string[]}
   */
  const fileList = [options?.files || []].flat();
  const versionFiles = fileList.flatMap((f) => {
    if (typeof f !== "string" || !hasMagic(f)) {
      return f;
    }
    const matches = glob.sync(f, { nodir: true }).sort();
    if (!matches.length) {
      log(`⚠️ No files matched "${f}"`);
    }
    return matches;
  });
  delete options.files;

  if (!versionFiles.length) {
    const source = configFile.filepath ? ` in ${configFile.filepath}` : "";
    log(
      `⚠️ No files to version. Expected a "files" array${source}, or files passed as arguments.`
    );
  }

  // Remove unneeded properties
  delete options.version;
  delete options.config;

  return Promise.all(versionFiles.map((f) => updateFile(f, version, options)));
}
