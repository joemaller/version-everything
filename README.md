# version-everything
Use npm to version all kinds of projects, not just JavaScript

Synchronize the version string from package.json into additional text or structured data files. When called from npm's version script, all versioned files in a project will be updated and committed with a single command. 

```sh
    npm install --save version-everything
```
## How to version everything

There are several ways version-everything can be used, the only requirement is an array of files to synchronize versions into. The files can be text (php, css, markdown, whatever) or structured data (JSON, yaml or xml).

The file list is an array specified in one of the following forms, in order or precedence:

1. Command line arguments
2. `files` key in a **.version-everything.js** file
3. version_files key in the parent project's package.json file

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
Passed directly to [`JSON.stringify`][stringify]. See [JSON docs][stringify] for options.

##### xml
Type: `object`
Passed directly to the [xml2js Builder class][xml2js-builder]. See [xml2js][] docs for available options.


##### yaml
Type: `object`
Passed directly to the [js-yaml safeDump method][safedump]. See [js-yml][] docs for available options.




[webpack]: https://webpack.github.io/docs/configuration.html
[eslint]: http://eslint.org/docs/user-guide/configuring#configuration-file-formats
[xml2js]: https://www.npmjs.com/package/xml2js
[xml2js-builder]: https://www.npmjs.com/package/xml2js#options-for-the-builder-class
[stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[js-yaml]: https://www.npmjs.com/package/js-yaml
[safedump]: https://www.npmjs.com/package/js-yaml#safedump-object---options-

