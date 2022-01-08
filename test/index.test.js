const readPkgUp = require("read-pkg-up");
const { cosmiconfigSync } = require("cosmiconfig");

const tmpFixture = require("./lib/tmp-fixture");
const versionEverything = require("../");

const cwd = process.cwd();
const fixtureDir = "./test/fixture/";

// const getVersionFiles = require("../app/get-version-files");
const updateFile = require("../app/update-file");

jest.mock("cosmiconfig");
jest.mock("read-pkg-up");
// jest.mock("../app/get-version-files");
jest.mock("../app/update-file");

let config = null;
let options = null;
let newVersion = "";
let packageJson = {};

/* @ts-ignore */
cosmiconfigSync.mockReturnValue({ search: () => config });

/* @ts-ignore */
readPkgUp.sync.mockImplementation(() => ({ packageJson }));

updateFile.mockImplementation((f, v, o) => {
  // console.log({ f, v, o });
  options = { ...o };
});

describe("Index file tests", () => {
  beforeEach(() => {
    newVersion = "1.414.21";
    packageJson = { name: "mock-package-json", version: newVersion };
    options = null;
  });

  afterEach(() => {
    readPkgUp.sync.mockClear();
    updateFile.mockClear();
  });

  test("get version from package.json", () => {
    const version = "5.7.9";
    packageJson = { name: "getversion", version };
    config = { config: { files: ["file"] } };
    versionEverything();
    expect(updateFile).toHaveBeenCalledWith("file", version, {});
  });

  test("manually specify version string", () => {
    const version = "11.22.33";
    config = { config: { files: ["file"] } };
    versionEverything({ version, quiet: true });
    expect(options).toHaveProperty("version", version);
  });

  test("Remap Prefix to Prefixes", () => {
    const configFiles = ["file1.js", "file2.json"];
    config = { config: { files: configFiles, prefix: "namespace/img:" } };
    versionEverything();
    expect(options).toHaveProperty("prefixes");
  });

  test("convert string prefix to array", () => {
    versionEverything({ version: newVersion, prefix: "namespace/img:" });
    expect(options).toHaveProperty("version", newVersion);
  });

  test("fallback to args when no config found", () => {
    config = null;
    versionEverything({ version: newVersion, files: ["file"] });
    expect(options).toHaveProperty("version", newVersion);
  });

  test("send prefix as array", () => {
    config = null;
    versionEverything({
      version: newVersion,
      files: ["file"],
      prefix: ["string/prefix:"],
    });
    expect(options).toHaveProperty("prefixes", ["string/prefix:"]);
  });

  test("no files", () => {
    config = null;
    versionEverything({ version: newVersion });
    expect(updateFile).not.toHaveBeenCalled();
  });

  test("should throw error if no version can be found", () => {
    packageJson = {};
    const files = ["a.txt", "b.txt"];
    expect(() => versionEverything({ files })).toThrowError(/No version found/);
  });
});
