#!/usr/bin/env node


// TODO: Add yargs, options to override package.json, list files

var versionEverything = require('.');

// TODO: This will be revamped with yargs stuff
var config = {
  files: process.argv.slice(2)
}
versionEverything(config);
