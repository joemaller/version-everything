# version-everything

#### Version: 0.6.4

Use npm to version all kinds of projects, not just JavaScript

[![npm](https://img.shields.io/npm/v/version-everything.svg)](https://www.npmjs.com/package/version-everything)
[![codecov](https://codecov.io/gh/joemaller/version-everything/branch/master/graph/badge.svg)](https://codecov.io/gh/joemaller/version-everything)
[![Coverage Status](https://coveralls.io/repos/github/joemaller/version-everything/badge.svg)](https://coveralls.io/github/joemaller/version-everything)
[![Maintainability](https://api.codeclimate.com/v1/badges/6b0958bcd94274198117/maintainability)](https://codeclimate.com/github/joemaller/version-everything/maintainability)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Synchronize the version string from package.json into a set of additional text or structured data files. When called from npm's version script, all versioned files in a project will be updated and committed with a single command.

```sh
    npm install --save version-everything
```

## How to version everything

There are several ways version-everything can be used, the only requirement is an array of files to synchronize versions into. The files can be text (php, css, markdown, whatever) or structured data (JSON or yaml<!-- or xml, eventually -->).

The file list is an array specified in one of the following forms, in order of precedence:

1. Command line arguments
2. `files` key in a **version-everything.config.js** file
3. `version-everything.files` key in the parent project's **package.json** file

### npm lifecycle script in package.json

The simplest way to use _version-everything_ is to hook into npm's version event. Once set up, a single `npm` command will update, commit and tag all versioned files in a project.

Add something like the following to your project's package.json file:

```json
{
  "version": "1.3.6",
  "scripts": {
    "version": "version-everything && git add -u"
  },
  "version-everything": {
    "files": [
      "README.md",
      "example_wordpress_plugin.php",
      "styles.css",
      "manifest.json",
      "sadness.xml"
    ]
  }
}
```

Then run a command like `npm version minor` to bump the version in all the files. It's that easy.

Note that structured data files will be formatted using default settings.

### Replacing version strings

In text files, the following version strings will be updated.

- `Version: 1.2.34`
- `### Version: 2.34.5` (Markdown headings)
- `* @version 4.5.67`
- `v0.6.0` (At end-of-line)
- `LABEL version="1.2.34"` (Dockerfiles)

_Notes:_ Colons are optional. Simple v-prefixed, git-tag style version strings must appear at the end of a line.

### version-everything config files

This project uses the [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) library to load config files.the file-key should be `version-everything`, so files like `.version-everythingrc` or `.version-everythingrc.js` will work.

The file should export a simple JS object and look something like this:

```js
module.exports = {
  files: ["README.md", "example_wordpress_plugin.php", "styles.css"],
  prefix: /* a string, regexp literal or mixed array of either */
  json: {
    /* optional json config object, keys pass directly to JSON.stringify */
  },
  yaml: {
    /* optional yaml config object, passes directly to js-yaml */
  },
  xml: {
    /* optional xml config object, passes directly to xml2js */
  },
};
```

Calling the `version-everything` binary prefers this file over settings in package.json.

### CommonJS module requires

Version-everything can also be used like any other Node module. The version string will be pulled from package.json and should be treated as a global constant or envvar.

```js
const version = require("version-everything");

version(["README.md", "manifest.json"], { json: { space: 4 } });
```

### Command Line Interface

When run from the command line, all arguments following the command are assumed to be file paths. This command would sync versions into `readme.md` and `manifest.json`:

```sh
$ version-everything readme.md manifest.json
```

#### Conflicting arguments

If a package.json is specified, it will be loaded first, then any subsequent args will be applied on top. So if package.json were to contain a `version-everything.files` array, that array would be overwritten by any list of files provided to the command line.

### Recognized File Extensions

Files with the following extensions will be recognized as structured text and parsed accordingly.

- **JSON** - `.json`
- **XML** - `.xml` <!--, `.plist`-->
- **YAML** - `.yml`, `.yaml`

## API

### versionEverything(files, [options])

All keys are optional. Files is _practically_ required, without a list of files there's nothing to do.

#### files

Type: `array`

An array containing the files which will be versioned.

#### prefix

Type: `string|RegExp|[string|RegExp]`

A string, RegExp, or a mixed array of either. Will be added to the list of standard version patterns to be replaced in plain-text files.

#### options

Type: `object`
All keys are optional.

#### json

Type: `object`
Three keys from the `json` object will be passed directly to [`JSON.parse`][jsonparse] or [`JSON.stringify`][stringify]: **`space`** which sets indentation from an integer or string, a **[`reviver`][reviver]** function and a **[`replacer`][replacer]** function/array. See the [JSON docs][stringify] for more info.

Default JSON Options:

```js
{
  space: 2,
  replacer: null,
  reviver: null,
}
```

#### xml

Type: `object`
Merged with a minimal set of defaults, then passed to the [xml-js `js2xml` converter][xml-js convert]. See [xml-js docs][] for available options.

Default XML Options:

```js
{
  compact: false,
  spaces: 2,
  indentCdata: true,
}
```

##### yaml

Type: `object`
Passed directly to the [js-yaml safeDump method][safedump]. See [js-yaml][] docs for available options.

### Notes

**npm** may fail to commit/tag files when `package.json` is nested below the git repository root. Ref: [npm#18795][npm18795]

Enabling `push.followTags` in Git's global config is highly recommended: `git config --global push.followTags true`

While this module strongly encourages the use of true SemVer versions, these are not enforced. Just about any wacky version string without a whitespace character should work.

Empty CData blocks `<![CDATA[]]>` will be removed from processed XML Documents. To preserve empty blocks, add one or more spaces: `<![CDATA[ ]]>`

[webpack]: https://webpack.github.io/docs/configuration.html
[eslint]: http://eslint.org/docs/user-guide/configuring#configuration-file-formats
[xml-js]: https://www.npmjs.com/package/xml-js
[xml-js convert]: https://www.npmjs.com/package/xml-js#convert-js-object--json-%E2%86%92-xml
[jsondocs]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[jsonparse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
[stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[reviver]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
[replacer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
[js-yaml]: https://www.npmjs.com/package/js-yaml
[safedump]: https://www.npmjs.com/package/js-yaml#safedump-object---options-
[npm18795]: https://github.com/npm/npm/issues/18795
