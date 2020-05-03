const readPkgUp = require("read-pkg-up");
const { cosmiconfigSync } = require("cosmiconfig");

const filesFromDeprecated = ({ packageJson }) => {
  let outputFiles = [];
  if (packageJson.version_files) {
    console.log(
      'Files loaded from deprecated "version_files" key.',
      'Please update this package.json file to use a "version-everything.files" key.'
    );
    outputFiles = packageJson.version_files;
  } else if (packageJson.versionFiles) {
    console.log(
      "Files loaded from deprecated 'versionFiles' key.",
      "Please update this package.json file to use a 'version-everything.files' key."
    );
    outputFiles = packageJson.versionFiles;
  }
  return outputFiles;
};
/**
 * Returns an array of files to version
 * @param  {array, object, string} args an array of filenames, an object representing a package.json file
 *                                      or an object containing a version-everything.files or files array
 *                                      or a string representing a file path. Input isn't validated.
 * @return {array} List of files to version
 */
module.exports = function (args) {
  let output = [];

  if (args) {
    let files = [];
    if (args["version-everything"]) {
      files = args["version-everything"].files || args;
    } else {
      files = args.files ? args.files : args;
    }
    output = Array.isArray(files) && files.length ? files : output;
    output = typeof files === "string" ? [files] : output;
  }

  if (!output.length) {
    const explorerSync = cosmiconfigSync("version-everything");
    const configFile = explorerSync.search();

    if (configFile && configFile.config) {
      output = configFile.config.files || [];
    } else {
      const pkg = readPkgUp.sync({ normalize: false });
      if (pkg) {
        output = filesFromDeprecated(pkg);
      }
    }
  }
  return output;
};
