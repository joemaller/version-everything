const fs = require("fs-extra");
const path = require("path");

const chalk = require("chalk");
// const sed = require('shelljs').sed;
// const yaml = require("js-yaml");
const xml2js = require("xml2js");
const builder = new xml2js.Builder();
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
module.exports = function(file, version, options, cb) {
  if (!file) throw new Error("A file argument is required.");
  if (!version) throw new Error("A version argument (string) is required.");
  const defaultOptions = {
    quiet: false,
    dryRun: false,
    json: { space: 2, replacer: null, reviver: null },
    xml: {},
    yaml: {}
  };

  const config = Object.assign({}, defaultOptions, options);
  const log = logInit(config.quiet);

  // first pass tries file extensions, if those don't match, try parsing
  // the file contents before falling back to plain-text regex replace
  // console.log(path.extname(file).toLowerCase())

  fs.readFile(file, "utf8", async (err, data) => {
    // TODO: Why not just throw here?
    if (err && cb && typeof cb === "function") return cb(err);
    let result;

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
        try {
          // trying file as unmarked JSON
          result = bumpJSON(data, version, config.json);
        } catch (err) {
          // not JSON
        }
        if (!result) {
          // No result, trying file as XML
        }
        if (!result) {
          // No result, trying file as YAML
          try {
            result = bumpYAML(data, version, config.yaml);
          } catch (err) {
            // not YAML
          }
        }
        if (!result) {
          // No result, trying file as plain text (RegExp)
          result = bumpPlainText(data, version);
        }
    }
    if (result) {
      const updateMsg = [
        "Updated",
        chalk.magenta(path.basename(file)),
        "from",
        chalk.gray(result.oldVersion),
        "to",
        chalk.cyan(version)
        // ...(options.dryRun ? ["\n", result.data] : [])
      ];
      // const val = await aPromise.catch(err => console.log(err));
      // console.log(options.dryRun);
      if (config.dryRun) {
        updateMsg.push("\n", result.data);
      } else {
        // try {
        //   fs.writeFileSync(file, result.data);
        // } catch (writeError) {
        //   console.log({ writeError });
        // }
        // const foo =
        await fs.writeFile(file, result.data)
        .catch(err => {
          // console.log({ rerr });
          cb(err)
          // throw new Error('BOOGA');
        });
        // console.log({ foo });
      }

      // err = options.dryRun ? err : await fs.writeFile(file, result.data);
      log(updateMsg.join(" "));
      // log(updateMsg, config.dryRun ? result.data : "");

      // if (options.dryRun) {
      //   log(updateMsg, result.data);
      //   if (cb && typeof cb === "function") cb(err, result);
      // } else {
      //   fs.writeFile(file, result.data, err => {
      //     log(updateMsg);
      //     if (cb && typeof cb === "function") cb(err, result);
      //   });
      // }
      // } else {
      //   if (cb && typeof cb === "function") cb(err);
    }
    // if (cb && typeof cb === "function") cb(err, result);
    cb(err, result);
  });
};
