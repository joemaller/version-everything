#!/usr/bin/env node

// @ts-check
import yargs from "yargs";

import getConfig from "./app/get-config.js";
import versionEverything from "./index.js";

/**
 * @type {object}
 */
const argv = yargs(process.argv.slice(2))
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
  .strictOptions()
  .version().argv;

versionEverything(getConfig(argv));
