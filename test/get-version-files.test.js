/* eslint-env node,mocha,chai */
/* eslint no-unused-vars: "should"*/

"use strict";

const should = require("chai").should();

const path = require("path");

const tmpFixture = require("../app/lib/tmp-fixture");

const getVersionFiles = require("../app/get-version-files");

/**
 * Uses 'versionFiles' property instead of 'version_files'
 */
const fakePackageJson = {
  packageJson: {
    name: "fake-package-json",
    version: "11.22.33",
    description: "Fake package.json for testing",
    versionFiles: [
      "file1.js",
      "file2.json",
      "file3.yml",
      "file4.xml",
      "file5.php"
    ]
  },
  path: "./test/fixture/deep/"
};

/**
 * uses old 'version_files' property
 */
const fakePackageJsonOld = {
  packageJson: {
    name: "fake-package-json",
    version: "11.22.33",
    description: "Fake package.json for testing",
    version_files: [
      "file1.js",
      "file2.json",
      "file3.yml",
      "file4.xml",
      "file5.php",
      "file6"
    ]
  },
  path: "./test/fixture/deep/"
};

/**
 * Includes both 'versionFiles' and 'version_files' properties
 */
const fakePackageJsonBoth = {
  packageJson: {
    name: "fake-package-json",
    version: "11.22.33",
    description: "Fake package.json for testing",
    versionFiles: [
      "file1.js",
      "file2.json",
      "file3.yml",
      "file4.xml",
      "file5.php"
    ],
    version_files: [
      "file1.js",
      "file2.json",
      "file3.yml",
      "file4.xml",
      "file5.php",
      "file6"
    ]
  },
  path: "./test/fixture/deep/"
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
 *   fake package.json old: 6 files
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
      let files = getVersionFiles("file1.js");
      expect(files).toHaveLength(1);
    });

    test("Handles an array of files", () => {
      let files = getVersionFiles(["file1.js", "file2.json"]);
      expect(files).toHaveLength(2);
    });

    test("Handles an object with a files array", () => {
      let files = getVersionFiles({
        files: ["file1.js", "file2.json", "file3.yml"]
      });
      expect(files).toHaveLength(3);
    });

    test("Handles an object with a file string", () => {
      let files = getVersionFiles({
        files: "file1.js"
      });
      expect(files).toHaveLength(1);
    });
  });

  describe("gets files from a .version-everything.js file", () => {
    test(
      "loads a .version-everything.js as sibilng of specified package.json file",
      () => {
        let files = getVersionFiles([], { path: "./deep/dotfile/package.json" });
        expect(files).toHaveLength(4);
      }
    );

    test("find .version-everything.js in nested dir", () => {
      let files = getVersionFiles([], {
        path: "./deep/dotfile/deeper/and_deeper"
      });
      expect(files).toHaveLength(4);
    });

    test("finds .version-everything.js in parent dir", () => {
      let files = getVersionFiles([], { path: "./deep/dotfile/deeper" });
      expect(files).toHaveLength(4);
    });
  });

  describe("gets files from package.json", () => {
    test("uses 'versionFiles' from specified package.json file", () => {
      let files = getVersionFiles([], fakePackageJson);
      expect(files).toHaveLength(5);
    });

    test("uses old 'version_files' from specified package.json file", () => {
      let files = getVersionFiles([], fakePackageJsonOld);
      expect(files).toHaveLength(6);
    });

    test(
      "uses 'versionFiles' before 'version_files' both are defined",
      () => {
        let files = getVersionFiles([], fakePackageJson);
        expect(files).toHaveLength(5);
      }
    );
  });

  describe("handles various false values", () => {
    test("version_files is empty array", () => {
      const files = getVersionFiles([]);
      expect(files).toHaveLength(0);
    });

    test("version_files is false", () => {
      const files = getVersionFiles(false);
      expect(files).toHaveLength(0);
    });

    test("version_files is null", () => {
      const files = getVersionFiles(null);
      expect(files).toHaveLength(0);
    });

    test("version_files is undefined", () => {
      const undef = {};
      const files = getVersionFiles(undef.foo);
      expect(files).toHaveLength(0);
    });
  });

  describe("fails gracefully", () => {
    test("no arguments, no fallbacks", () => {
      let files = getVersionFiles();
      console.log(files);
      expect(files).toHaveLength(0);
    });
  });
});
