#!/usr/bin/env node

const { Console } = require("console");
const { readFileSync } = require("fs");
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
    describe:
      "Match version strings appearing after this prefix. When combined with positional arguments (files), terminate the array with '--'.",
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
    "$0 --prefix 'namespace/foo-img:' -- a/docker-compose.yml",
    "Matches versions used as tags for docker images like 'namespace/foo-img:1.2.3'. Prefixes should be terminated with '--'."
  )
  .example(
    "$0 a/docker-compose.yml --prefix 'namespace/foo-img:'",
    "Prefixes appearing last do not need to be terminated."
  )
  .help("help")
  .alias({ help: "h" })
  .version().argv;

const getConfig = (yargsObject = { _: [] }) => {
  let config = {};
  if (yargsObject.packageJson) {
    const packageJsonPath = path.resolve(yargsObject.packageJson);

    try {
      const pkg = readFileSync(packageJsonPath, "utf8").toString();
      config.version = JSON.parse(pkg).version;
      config._searchFrom = path.dirname(packageJsonPath);
    } catch (e) {
      throw "Unable to read package.json file\n" + e;
    }
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

module.exports = getConfig;

/* istanbul ignore next */
if (require.main === module) {
  versionEverything(getConfig(argv));
}
