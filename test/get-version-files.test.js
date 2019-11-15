/* eslint-env node,mocha,chai */
/* eslint no-unused-vars: "should"*/

"use strict";

// const should = require("chai").should();

// const path = require("path");

const tmpFixture = require("../app/lib/tmp-fixture");

const getVersionFiles = require("../app/get-version-files");

/**
 * Uses 'versionFiles' property instead of 'version_files'
 */
const fakePackageJson = {
  name: "fake-package-json",
  version: "11.22.33",
  description: "Fake package.json for testing",
  "version-everything": {
    files: ["file1.js", "file2.json", "file3.yml", "file4.xml", "file5.php"]
  }
};

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
        files: ["file1.js", "file2.json", "file3.yml"]
      });
      expect(files).toHaveLength(3);
    });

    test("Handles an object with a file string", () => {
      const files = getVersionFiles({
        files: "file1.js"
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
      process.chdir("./package");
      const files = getVersionFiles();
      expect(files).toHaveLength(5);
    });

    test("load old-style version_files key from old package.json file", () => {
      process.chdir("./old-package-version_files");
      const files = getVersionFiles();
      expect(files).toHaveLength(5);
    });

    test("load new-old-style versionFiles key from old package.json file", () => {
      process.chdir("./old-package-versionFiles");
      const files = getVersionFiles();
      expect(files).toHaveLength(5);
    });

    test("load prefer version-everything.files over version_files from package.json file", () => {
      process.chdir("./old-n-new-package");
      const files = getVersionFiles();
      expect(files).toHaveLength(5);
    });

    test("load version-everything.files key from cosmiconfig file", () => {
      process.chdir("./cosmiconfig");
      const files = getVersionFiles();
      expect(files).toHaveLength(5);
    });

    test("fail loading version-everything from cosmiconfig with no files", () => {
      process.chdir("./cosmiconfig-no-files");
      const files = getVersionFiles();
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
