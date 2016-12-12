#!/usr/bin/env node

const path = require('path');
const sed = require('shelljs').sed;
const jsonfile = require('jsonfile');
const pkg = require('./package.json');

if (!pkg.version_files) return;

pkg.version_files.forEach(f => {
    console.log('f?', f);
//   jsonfile.readFile(f, (err, data) => {
//     if (err) {
//      sed('-i', /^([# ]*Version: *).*/, `$1${ pkg.version }`, f);
//     } else  {
//       data.version = pkg.version;
//       jsonfile.writeFileSync(f, data, {spaces: 2});
//     }
//   });
});
