#!/usr/bin/env node

const path = require("path");

const argv = require("yargs")
  .usage("Usage: $0 [options] [files...]")
  .option("package-json", {
    alias: "p",
    describe: "load a specific package.json file",
    type: "string"
  })
  // .option("dry-run", {
  //   alias: "n",
  //   describe: "do not update files",
  //   type: "boolean"
  // })
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

const versionEverything = require(".");

const config = !argv.packageJson ? {} : require(path.resolve(argv.packageJson));
if (!config["version-everything"]) {
  config["version-everything"] = { files: [], options: {} };
}
if (argv._.length) {
  config["version-everything"].files = argv._;
}
if (argv.quiet) {
  config["version-everything"].options.quiet = argv.quiet;
}

versionEverything(config);
