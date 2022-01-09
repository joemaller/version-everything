// @ts-check
const tmpFixture = require("./lib/tmp-fixture");
const cli = require("../cli.js");

const cwd = process.cwd();
const fixtureDir = "./test/fixture/";

const fakeYargs = { _: [], $0: "cli.js" };

describe("Test the CLI", () => {
  beforeEach(() => {
    process.chdir(tmpFixture(fixtureDir));
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  test("Call without args", () => {
    const config = cli();
    expect(config).toEqual({});
  });

  test("Call with file list", () => {
    const args = { _: ["file1.js", "file2.txt"] };
    const config = cli(args);
    expect(config.files).toHaveLength(2);
  });

  test("Specify a package.json file", () => {
    process.chdir("./package");
    const args = { ...fakeYargs, packageJson: "package.json" };
    const config = cli(args);
    expect(config).toHaveProperty("_searchFrom");
  });

  test("Fail unreadable package.json file", () => {
    process.chdir("./package-syntax-error");
    const args = { ...fakeYargs, packageJson: "not-package.json" };
    expect(() => cli(args)).toThrow(/Unable to read package.json file/);
  });

  test("no arguments, pass empty object", () => {
    const args = { ...fakeYargs, "version-everything": {} };
    const config = cli(args);
    expect(config).not.toHaveProperty("files");
  });

  test("Passes quiet flag", () => {
    const args = { ...fakeYargs, quiet: true };
    const config = cli(args);
    expect(config).toHaveProperty("quiet");
  });

  test("Passes dry-run flag", () => {
    const args = { ...fakeYargs, "dry-run": true };
    const config = cli(args);
    expect(config).toHaveProperty("dryRun");
  });

  test("Pass an array of prefixes", () => {
    const prefix = ["namespace/foo-img:", "foo/bar"];
    const args = { ...fakeYargs, prefix };
    const config = cli(args);
    expect(config).toHaveProperty("prefixes", prefix);
  });
});
