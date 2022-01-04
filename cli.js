#!/usr/bin/env node

const path = require("path");

const yargs = require("yargs");

const versionEverything = require(".");

const argv = yargs
  .usage("Usage: $0 [options] [files...]")
  .option("package-json", {
    alias: "p",
    describe: "load a specific package.json file",
    type: "string",
  })
  .option("prefix", {
    describe: "Match version numbers appearing after this prefix",
    type: "array",
  })
  .option("dry-run", {
    alias: "n",
    describe: "do not update files",
    type: "boolean",
  })
  .option("quiet", {
    alias: "q",
    describe: "suppress console output",
    type: "boolean",
  })
  .example(
    "$0 -p b/package.json a/file.txt",
    "Reads version string from b/package.json and applies it to a/file.txt"
  )
  .example(
    "$0 --prefix 'namespace/foo-img:' a/docker-compose.yml",
    "Matches versions used as tags for docker images like 'namespace/foo-img:1.2.3'"
  )
  .help("help")
  .alias({ help: "h" })
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
  if (yargsObject.prefix) {
    if (typeof yargsObject.prefix === "string") {
      yargsObject.prefix = [yargsObject.prefix];
    }
    config["version-everything"].options.prefixes = yargsObject.prefix;
  }
  return config;
};

module.exports = getConfig;

/* istanbul ignore next */
if (require.main === module) {
  versionEverything(getConfig(argv));
}
