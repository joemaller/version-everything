# version-everything

#### Version: 0.12.2

Use npm to version all kinds of projects, not just JavaScript

[![npm](https://img.shields.io/npm/v/version-everything.svg)](https://www.npmjs.com/package/version-everything)
[![codecov](https://codecov.io/gh/joemaller/version-everything/graph/badge.svg?token=YeSK4SK8rr)](https://codecov.io/gh/joemaller/version-everything)
[![Coverage Status](https://coveralls.io/repos/github/joemaller/version-everything/badge.svg)](https://coveralls.io/github/joemaller/version-everything)
[![Maintainability](https://qlty.sh/gh/joemaller/projects/version-everything/maintainability.svg)](https://qlty.sh/gh/joemaller/projects/version-everything)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://prettier.io)

Synchronize versions from package.json into additional text or structured data files. When called from npm's **version** script, all versioned files in a project will be updated and committed with a single command.

```sh
    npm install --save-dev version-everything
```

## How to version everything

There are several ways version-everything can be used, the only requirement is an array of files to synchronize versions into. The files can be text (php, css, markdown, whatever) or structured data (JSON, YAML, XML or plists).

The file list is an array specified in one of the following forms, in order of precedence:

1. Command line arguments
2. `files` key in a **version-everything.config.js** file
3. `version-everything.files` key in the parent project's **package.json** file

File lists may include glob patterns like `src/**/block.json`. Patterns are matched relative to the current working directory.

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

Now running a command like `npm version minor` will bump the project version and update version strings in all listed files. It's that easy!

Some structured data files may be formatted using default settings.

### Replacing version strings

In text files, the following version strings will be updated.

- `Version: 1.2.34`
- `### Version: 2.34.5` (Markdown headings)
- `* @version 4.5.67` and `/** @version 4.5.67 */` ([PHPDoc tags](https://docs.phpdoc.org/guide/references/phpdoc/tags/version.html#version))
- `v0.6.0` (At end-of-line)
- `LABEL version="1.2.34"` (Dockerfiles)
- `"Project-Id-Version: My Plugin 1.2.34\n"` (gettext `.pot` and `.po` translation files)

_Notes:_ Colons are optional. Simple v-prefixed, [git-tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) style version strings must appear at the end of a line.

#### Additional Prefixes

Additional string or RegExp patterns can be added to the list of default patterns and will match against plain text files. When prefixes are specified, structured data files will be processed first as plain text, then again as structured data if no versions are found.

If a stuctured data file contains a comment and a version attribute, including an empty prefix will update both. (ref: [#15](https://github.com/joemaller/version-everything/issues/15#issuecomment-1685039468))

### version-everything config files

This project uses [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) to load config files. The file-key should be `version-everything`, so files like `.version-everythingrc` or `.version-everythingrc.js` will work.

Config files should export a simple JS object and look something like this (a config file which only exports an array will be treated as the list of files):

```js
module.exports = {
  files: ["README.md", "example_wordpress_plugin.php", "styles.css"],
  prefix: /* a string, regexp literal or mixed array of either */
  json: {
    /* optional json config object, keys pass directly to JSON.stringify */
  },
  yaml: {
    /* optional yaml config object, passed to the yaml library */
  },
  xml: {
    /* optional xml config object, see options.xml below */
  },
};
```

### Replacing xml attribute values

Version-everything can increment custom attributes in xml files when a keys array is set in the xml config object:

```js
{
	"xml": {
		"keys": [
			"~project-version",
			"root~project-version",
			"element/hierarchy/relative/to/root~attribute-name"
		]
	}
}
```

This option will add the attribute when missing, set the value when attribute is present but has no value and modify the value when attribute exists and has value.

The `/` character is used to specify nesting of elements (based on element names). When using this syntax the first element is **always the root element**.

The `~` character is used to specify the end of the hierarchy and beginning of attribute name. When the `~` character is missing or is the first character the operation will be applied to the root element (regardless of its name). To perform the operation only on a specific root element specify its name before the `~` character.

### Plist files

Apple's plist files are parsed independently from standard XML. A `Version` key will be added to the root `<dict>` element. Following convention, all plist keys are title-case.

### ES Module Imports

Version-everything can be used like any other esm Node module. The version string will be pulled from package.json and should be treated as a global constant or envvar.

```js
import versionEverything from "./index.js";

versionEverything({ files: ["README.md", "file.json"], json: { space: 4 } });
```

This project is [pure ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

### Command Line Interface (CLI)

When run from the command line, all arguments following the command are assumed to be file paths. This command would sync versions into `readme.md` and `manifest.json`:

```sh
$ version-everything readme.md manifest.json
```

#### Other CLI flags

The following additional flags map to version-everything settings. Run `version-everything -h` for full usage info.

- `-p`, `--package-json` `<path to package.json file>`<br>Loads a specific package.json file. When present, this will also be used as the starting location for Cosmiconfig.

- `n`, `--dry-run`<br> Runs the command without modifying any files.
- `q`, `--quiet`<br> Run the command silently, without showing update messages.
- `--prefix <prefixes...>`<br>One or more additional pattern prefixes to match against.

#### Conflicting arguments

If a **package.json** is specified, it will be loaded first, then any subsequent args will be applied on top. So if **package.json** were to contain a `version-everything.files` array, that array would be overwritten by any list of files provided to the command line.

### Recognized File Extensions

Files with the following extensions will be recognized as structured text and parsed accordingly.

- **JSON** - `.json`
- **XML** - `.xml`
- **YAML** - `.yml`, `.yaml`
- **PLIST** - `.plist`
- **TEXT** - `.markdown`, `.md`, `.mdown`, `.po`, `.pot`, `.sh`, `.text`, `.txt`

## API

### versionEverything([options])

All keys are optional. `options.files` is _practically_ required, without a list of files there's nothing to do.

#### options

Type: `object`
All keys are optional.

##### options.files

Type: `array`

An array containing the files which will be versioned.

##### options.version

Type: `string`

A valid SemVer version.

##### options.prefix

Type: `string|RegExp|[string|RegExp]`

A string, RegExp, or a mixed array of either. Will be added to the list of standard version patterns to be replaced in plain-text files.

##### options.json

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

##### options.xml

Type: `object`

XML files are read and written with [fast-xml-parser][]. The `xml` object accepts these keys:

- **`keys`** – Attributes to update, see [Replacing xml attribute values](#replacing-xml-attribute-values).
- **`spaces`** – Indentation, either a number of spaces or a string such as `"\t"`. Default: `2`.
- **`parser`** – Options passed to fast-xml-parser's [`XMLParser`][fxp parser options].
- **`builder`** – Options passed to fast-xml-parser's [`XMLBuilder`][fxp builder options].

Default XML Options:

```js
{
  spaces: 2,
}
```

Some fast-xml-parser options are required for version-everything to work, and always override `parser` and `builder` settings: `preserveOrder`, `ignoreAttributes`, `attributeNamePrefix`, `textNodeName`, `cdataPropName`, `commentPropName` and `processEntities`.

Entities like `&amp;` are copied through unchanged and values are kept as strings, so numbers like `007` are not rewritten. Comments, CDATA, processing instructions and `<!DOCTYPE>` declarations are kept. Elements containing both text and child elements (mixed content) may be re-indented.

##### Migrating XML options

Before version 1.0, XML files were processed with [xml-js][], and the `xml` object was passed straight to it. Most projects only used `spaces` or `keys`, which work as before. Other xml-js options are ignored, and version-everything logs a warning listing them.

| xml-js option               | Replacement                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `spaces`                    | Unchanged.                                                                                                                                |
| `keys`                      | Unchanged. (Not an xml-js option.)                                                                                                        |
| `compact`                   | Remove it. Only full documents were ever supported.                                                                                       |
| `indentCdata`               | Remove it. CDATA sections between elements are always placed on their own indented line, which matches the old default.                   |
| `fullTagEmptyElement: true` | `builder: { suppressEmptyNode: false }`                                                                                                   |
| `spaces: 0` (single line)   | `builder: { format: false }`                                                                                                              |
| Any other xml-js option     | Remove it. Check the fast-xml-parser [`XMLParser`][fxp parser options] and [`XMLBuilder`][fxp builder options] options for an equivalent. |

Changes to XML output:

- A trailing newline at the end of the file is kept. It used to be removed.
- Empty CDATA blocks `<![CDATA[]]>` are kept. They used to be removed.
- Processing instructions after the XML declaration, such as `<?xml-stylesheet ...?>`, are written on their own line.
- Files which aren't valid XML are rejected with an error describing the problem. Files without an extension then fall through to YAML and plain-text handling as before.
- When using `keys`:
  - Old versions from nested keys like `a/b~version` are now reported.
  - A `<version>` element is no longer added when an earlier key matched but a later one didn't.
  - An attribute is no longer set on an element partway along a path that doesn't fully match.

##### options.yaml

Type: `object`

Merged with a minimal set of defaults, then passed to the [yaml][] library when parsing and writing the document. See the [yaml options docs][yaml options] for available options.

Default YAML Options:

```js
{
  nullStr: "",
}
```

### Notes

**npm** may fail to commit/tag files when `package.json` is nested below the git repository root. Ref: [npm#18795][npm18795]

Enabling `push.followTags` in Git's global config is highly recommended: `git config --global push.followTags true`

[webpack]: https://webpack.github.io/docs/configuration.html
[eslint]: http://eslint.org/docs/user-guide/configuring#configuration-file-formats
[xml-js]: https://www.npmjs.com/package/xml-js
[fast-xml-parser]: https://www.npmjs.com/package/fast-xml-parser
[fxp parser options]: https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4%2C%20v5/2.XMLparseOptions.md
[fxp builder options]: https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4%2C%20v5/3.XMLBuilder.md
[jsondocs]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[jsonparse]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
[stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[reviver]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
[replacer]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
[yaml]: https://www.npmjs.com/package/yaml
[yaml options]: https://eemeli.org/yaml/#options
[npm18795]: https://github.com/npm/npm/issues/18795
