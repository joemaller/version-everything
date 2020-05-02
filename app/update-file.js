const fs = require("fs-extra");
const path = require("path");

const universalify = require("universalify");
const chalk = require("chalk");

// const xml2js = require("xml2js");
// const builder = new xml2js.Builder();
const logInit = require("./lib/log-init");

const bumpPlainText = require("./lib/bump-plain-text");
const bumpJSON = require("./lib/bump-json");
const bumpYAML = require("./lib/bump-yaml");

/**
 * Sends files to the correct bumping function, writes the result
 * @param {[type]} file    [description]
 * @param {[type]} version [description]
 * @param {object} options Config options, quiet, json, xml and yaml
 * @param {[function]} cb   standard node callback mostly used for testing
 */
const updateFile = async (file, version, options = {}) => {
  if (!file) {
    throw new Error("A file argument is required.");
  }
  if (!version) {
    throw new Error("A version argument (string) is required.");
  }
  if (typeof options !== "object") {
    throw new Error("Callback must be a function.");
  }

  const defaultOptions = {
    quiet: false,
    dryRun: false,
    json: { space: 2, replacer: null, reviver: null },
    xml: {},
    yaml: {},
  };

  const config = Object.assign({}, defaultOptions, options);
  const log = logInit(config.quiet);

  // first pass tries file extensions, if those don't match, try parsing
  // the file contents before falling back to plain-text regex replace
  // console.log(path.extname(file).toLowerCase())

  // const data = await fs.readFile(file, "utf8").catch((err) => new Error(err));
  const data = await fs.readFile(file, "utf8").catch((err) => err);

  let result;
  if (data.errno && data.code) {
    result = data;
  } else {
    switch (path.extname(file).toLowerCase()) {
      case ".json":
        result = bumpJSON(data, version, config.json);
        break;

      // These need to be commented out or coverage reports the switch as uncovered
      // case ".xml":
      // case ".plist":
      // XML or PLIST FILE!
      // break;

      case ".yml":
      case ".yaml":
        result = bumpYAML(data, version, config.yaml);
        break;

      default:
        // no extension match
        // trying file as unmarked JSON
        try {
          result = bumpJSON(data, version, config.json);
        } catch (err) {}
        if (!result) {
          // No result, trying file as XML
        }
        if (!result) {
          // No result, trying file as YAML
          try {
            result = bumpYAML(data, version, config.yaml);
          } catch (error) {}
        }
        if (!result) {
          // No result, trying file as plain text (RegExp)
          result = bumpPlainText(data, version);
        }
    }
  }

  if (result) {
    let updateMsg;

    if (result.errno && result.code) {
      updateMsg = [chalk.red.bold(result.toString())];
    } else {
      updateMsg = [
        "Updated",
        chalk.magenta(path.basename(file)),
        "from",
        chalk.gray(result.oldVersion),
        "to",
        chalk.cyan(version),
      ];

      if (config.dryRun) {
        updateMsg.push("\n", result.data);
      } else {
        try {
          await fs.writeFile(file, result.data);
        } catch (err) {
          throw err;
        }
      }
    }
    log(updateMsg.join(" "));
  }
  return result;
};

module.exports = universalify.fromPromise(updateFile);
