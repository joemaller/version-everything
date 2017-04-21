# version-everything
#### Version: 0.1.2

Use npm to version all kinds of projects, not just JavaScript

[![Build Status](https://travis-ci.org/joemaller/version-everything.svg?branch=master)](https://travis-ci.org/joemaller/version-everything) 
[![Coverage Status](https://coveralls.io/repos/github/joemaller/version-everything/badge.svg?branch=master)](https://coveralls.io/github/joemaller/version-everything?branch=master) 
[![npm](https://img.shields.io/npm/v/version-everything.svg)](https://www.npmjs.com/package/version-everything)
[![dependencies Status](https://david-dm.org/joemaller/version-everything/status.svg)](https://david-dm.org/joemaller/version-everything)
[![devDependencies Status](https://david-dm.org/joemaller/version-everything/dev-status.svg)](https://david-dm.org/joemaller/version-everything?type=dev)
<!-- [![libhive - Open source examples](https://www.libhive.com/providers/npm/packages/version-everything/examples/badge.svg)](https://www.libhive.com/providers/npm/packages/version-everything)  -->

Synchronize the version string from package.json into a set of additional text or structured data files. When called from npm's version script, all versioned files in a project will be updated and committed with a single command. 

```sh
    npm install --save version-everything
```
## How to version everything

There are several ways version-everything can be used, the only requirement is an array of files to synchronize versions into. The files can be text (php, css, markdown, whatever) or structured data (JSON, yaml or xml).

The file list is an array specified in one of the following forms, in order of precedence:

1. Command line arguments
2. `files` key in a **.version-everything.js** file
3. `version_files` key in the parent project's **package.json** file

### npm lifecycle script in package.json

The simplest way to use *version-everything* is to hook into npm's version event. Once set up, a single `npm` command will update, commit and tag all versioned files in a project. 

Add something like the following to your project's package.json file:

```json
{
    "version": "1.3.6",
    "scripts": {
        "version": "version-everything && git add -u"
    },
    "version_files": [
        "README.md",
        "example_wordpress_plugin.php",
        "styles.css",
        "manifest.json",
        "sadness.xml"
    ]
}
```

Then run a command like `npm version minor` to bump the version in all the files. It's that easy. 

Note that structured data files will be formatted using default settings. 


### .version-everything.js dotfile

Following the lead of projects like [Webpack][] and [ESLint][], version-everything can also be configured using a JavaScript dotfile. While this introduces another file to the project, it offers additional configuration options, can be documented in place and keeps package.json cleaner.

A project's .version-everything.js file should be a sibling of the project's package.json file.

The basic schema of the config file should look something like this:

```js
module.exports = {
    files: [
        "README.md",
        "example_wordpress_plugin.php",
        "styles.css"
    ],
    json: { /* optional json config object, keys pass directly to JSON.stringify */ },
    yaml: { /* optional yaml config object, passes directly to js-yaml */ },
    xml: { /* optional xml config object, passes directly to xml2js */ }
}
```

Calling the `version-everything` binary prefers this file over settings in package.json.


### CommonJS module requires
Version-everything can also be used like any other Node module. The version string will be pulled from package.json and should be treated as a global constant or envvar. 


```js
const version = require('version-everything');

version(["README.md", "manifest.json"], { json: {space: 4} });

```

### Command Line Interface

When run from the command line, all arguments following the command are assumed to be file paths. This command would sync versions into `readme.md` and `manifest.json`:

```sh
$ version-everything readme.md manifest.json
```

### Recognized File Extensions
Files with the following extensions will be recognized as structured text and parsed accordingly.

* **JSON** - `.json`
* **XML** - `.xml`, `.plist`
* **YAML** - `.yml`, `.yaml`


## API

### versionEverything(files, [options])

#### files

Type: `array`

An array containing the files which will be versioned. 


#### options

Type: `object`
All keys are optional.

##### json 
Type: `object`
Three keys from the `json` object will be passed directly to [`JSON.parse`][jsonparse] or [`JSON.stringify`][stringify]: **`space`** which sets indentation from an integer or string, a **[`reviver`][reviver]** function and a **[`replacer`][replacer]** function/array. See the [JSON docs][stringify] for more info.

##### xml
Type: `object`
Passed directly to the [xml2js Builder class][xml2js-builder]. See [xml2js][] docs for available options.


##### yaml
Type: `object`
Passed directly to the [js-yaml safeDump method][safedump]. See [js-yaml][] docs for available options.



### Notes

While this module strongly encourages the use of true SemVer versions, these are not enforced. Just about any wacky version string should work.


[webpack]: https://webpack.github.io/docs/configuration.html
[eslint]: http://eslint.org/docs/user-guide/configuring#configuration-file-formats
[xml2js]: https://www.npmjs.com/package/xml2js
[xml2js-builder]: https://www.npmjs.com/package/xml2js#options-for-the-builder-class
[jsondocs]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[jsonparse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
[stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[reviver]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
[replacer]: 
[js-yaml]: https://www.npmjs.com/package/js-yaml
[safedump]: https://www.npmjs.com/package/js-yaml#safedump-object---options-

