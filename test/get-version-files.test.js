//@ts-check

const readPkgUp = require("read-pkg-up");
const { cosmiconfigSync } = require("cosmiconfig");
const tmpFixture = require("./lib/tmp-fixture");

const getVersionFiles = require("../app/get-version-files");

const fakePackageJson = {
  name: "fake-package-json",
  version: "11.22.33",
  description: "Fake package.json for testing",
  "version-everything": {
    files: ["file1.js", "file2.json", "file3.yml", "file4.xml", "file5.php"],
  },
};

let config = null;

jest.mock("cosmiconfig");

/* @ts-ignore */
cosmiconfigSync.mockReturnValue({
  search: () => config,
});

const cwd = process.cwd();
const fixtureDir = "./test/fixture/";

/**
 * for version_files testing:
 *   strings:       1 file
 *   arrays:        2 files
 *   objects:       3 files
 *   dotfiles:      4 files
 *   fake package.json:  5 files
 */

const consoleLog = console.log;
const stdoutWrite = process.stdout.write;

afterEach(() => {
  //  clean up console.log mocks
  console.log = consoleLog;
  process.stdout.write = stdoutWrite;

  // reset cosmiconfig mock
  config = null;
});

describe("Get a list of files to version", () => {
  beforeEach(() => {
    process.chdir(tmpFixture(fixtureDir));
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  describe("accepts a variety of config arguments", () => {
    test("Handles a single file as a string", () => {
      const files = getVersionFiles("file1.js");
      expect(files).toHaveLength(1);
    });

    test("Handles an array of files", () => {
      const files = getVersionFiles(["file1.js", "file2.json"]);
      expect(files).toHaveLength(2);
    });

    test("Handles an object with a files array", () => {
      const files = getVersionFiles({
        files: ["file1.js", "file2.json", "file3.yml"],
      });
      expect(files).toHaveLength(3);
    });

    test("Handles an object with a file string", () => {
      const files = getVersionFiles({
        files: "file1.js",
      });
      expect(files).toHaveLength(1);
    });
  });

  describe("load config from files", () => {
    test("load version-everything.files key from package.json object", () => {
      const files = getVersionFiles(fakePackageJson);
      expect(files).toHaveLength(5);
    });

    test("load version-everything.files key from package.json file", () => {
      const configFiles = ["file1.js", "file2.json"];
      config = { config: { files: configFiles } };
      const files = getVersionFiles();
      expect(files).toHaveLength(configFiles.length);
      expect(files).toEqual(configFiles);
    });

    test("load old-style version_files key from old package.json file", () => {
      let output = "";
      console.log = (str) => (output += str);

      process.chdir("./old-package-version_files");
      const files = getVersionFiles();
      expect(files).toHaveLength(5);
      expect(output).toMatch(/deprecated/);
    });

    test("load new-old-style versionFiles key from old package.json file", () => {
      let output = "";
      console.log = (str) => (output += str);
      process.chdir("./old-package-versionFiles");
      const files = getVersionFiles();
      expect(files).toHaveLength(5);
      expect(output).toMatch(/deprecated/);
    });

    test("package.json file doesn't have any keys to use", () => {
      process.chdir("./package-empty");
      const files = getVersionFiles();
      expect(files).toHaveLength(0);
    });

    test("prefer version-everything.files over version_files from package.json file", () => {
      process.chdir("./old-n-new-package");
      const configFiles = ["file1.js", "file2.json"];
      config = { config: { files: configFiles } };
      const files = getVersionFiles();
      expect(files).toHaveLength(configFiles.length);
    });

    test("load version-everything.files key from cosmiconfig file", () => {
      const configFiles = ["file1.js", "file2.json"];
      config = { config: { files: configFiles } };
      const files = getVersionFiles();
      expect(files).toHaveLength(configFiles.length);
    });

    test("fail loading version-everything from cosmiconfig with no files", () => {
      process.chdir("./cosmiconfig-no-files");
      const files = getVersionFiles();
      expect(files).toHaveLength(0);
    });
  });

  describe("Default and missing arguments", () => {
    test("Loads cosmiconfig if config is empty", () => {
      const configFiles = ["file1.js", "file2.json"];
      config = { config: { files: configFiles } };
      const files = getVersionFiles({ files: [], options: {} });
      expect(files).toHaveLength(configFiles.length);
    });

    test("Loads cosmiconfig if config.files is empty", () => {
      const configFiles = ["file1.js", "file2.json", "file3.yml"];
      config = { config: { files: configFiles } };
      const files = getVersionFiles({ files: [] });
      expect(files).toHaveLength(configFiles.length);
    });

    test("Loads cosmiconfig if config.files is false!?", () => {
      const configFiles = ["file1.js", "file2.json"];
      config = { config: { files: configFiles } };
      const files = getVersionFiles({ files: false });
      expect(files).toHaveLength(configFiles.length);
    });

    test("Loads cosmiconfig if config.options is empty", () => {
      const configFiles = ["file1.js", "file2.json"];
      config = { config: { files: configFiles } };
      const files = getVersionFiles({ options: {} });
      expect(files).toHaveLength(configFiles.length);
    });

    test("Fail gracefully if cosmiconfig has no files", () => {
      config = { config: { pie: "pecan" } };
      const files = getVersionFiles({ options: {} });
      expect(files).toHaveLength(0);
    });
  });

  describe("handles various false values", () => {
    test("version-everything is missing", () => {
      const files = getVersionFiles({});
      expect(files).toHaveLength(0);
    });

    test("version-everything.files is missing", () => {
      const files = getVersionFiles({ "version-everything": {} });
      expect(files).toHaveLength(0);
    });

    test("version-everything.files is empty", () => {
      const files = getVersionFiles({ "version-everything": { files: [] } });
      expect(files).toHaveLength(0);
    });

    test("version-everything.files is false", () => {
      const files = getVersionFiles(false);
      expect(files).toHaveLength(0);
    });

    test("version-everything.files is null", () => {
      const files = getVersionFiles(null);
      expect(files).toHaveLength(0);
    });
  });

  describe("fails gracefully", () => {
    test("no arguments, no fallbacks", () => {
      const files = getVersionFiles();
      expect(files).toHaveLength(0);
    });
  });
});
