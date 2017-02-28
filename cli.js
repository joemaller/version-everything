#!/usr/bin/env node

const argv = require('yargs')
  .usage('Usage: $0 [options] [files...]')
  .option('package-json', {
    alias: 'p',
    describe: 'load a specific pakage.json file',
    type: 'string'
  })
  .option('dry-run', {
    alias: 'n',
    describe: 'do not update files',
    type: 'boolean'
  })
  .option('quiet', {
    alias: 'q',
    describe: 'suppress console output',
    type: 'boolean'
  })
  .example(
    '$0 -p b/package.json a/file.txt',
    'Reads version string from b/package.json and applies it to a/file.txt'
  )
  .help()
  .version()
  .argv;


// TODO: Add yargs, options to override package.json, list files

var versionEverything = require('.');

// TODO: This will be revamped with yargs stuff
var config = {
  // files: process.argv.slice(2)
  files: argv._,
  quiet: argv.quiet
}
if (argv.package_json) config.package_json = argv.package_json;

console.log(argv, argv._);
console.log(config);
// versionEverything(config);
