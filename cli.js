#!/usr/bin/env node

const path = require("path");

const yargs = require("yargs");

const versionEverything = require(".");

const argv = yargs
  .usage("Usage: $0 [options] [files...]")
  .option("package-json", {
    alias: "p",
    describe: "load a specific package.json file",
    type: "string"
  })
  .option("dry-run", {
    alias: "n",
    describe: "do not update files",
    type: "boolean"
  })
  .option("quiet", {
    alias: "q",
    describe: "suppress console output",
    type: "boolean"
  })
  .example(
    "$0 -p b/package.json a/file.txt",
    "Reads version string from b/package.json and applies it to a/file.txt"
  )
  .help()
  .version().argv;

const getConfig = (yargsObject = { _: [] }) => {
  const config = {};
  if (yargsObject.packageJson) {
    Object.assign(config, require(path.resolve(yargsObject.packageJson)));
  }
  if (!config["version-everything"]) {
    config["version-everything"] = { files: [], options: {} };
  }
  if (yargsObject._.length) {
    config["version-everything"].files = yargsObject._;
  }
  if (yargsObject.quiet) {
    config["version-everything"].options.quiet = yargsObject.quiet;
  }
  return config;
};

module.exports = getConfig;

/* istanbul ignore next */
if (require.main === module) {
  versionEverything(getConfig(argv));
}
