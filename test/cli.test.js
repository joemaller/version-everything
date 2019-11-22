const tmpFixture = require("../app/lib/tmp-fixture");
const cli = require("../cli.js");
// const versionEverything = require("../");

const cwd = process.cwd();
const fixtureDir = "./test/fixture/";

const fakeYargs = { _: [], $0: "cli.js" };

// jest.mock('../')
// const versionEverything = jest.genMockFromModule('../');

describe("Test the CLI", () => {
  beforeEach(() => {
    process.chdir(tmpFixture(fixtureDir));
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  test("Call without args", () => {
    const config = cli();
    expect(config).toHaveProperty("version-everything");
  });

  test("Call with file list", () => {
    const args = { _: ["file1.js", "file2.txt"] };
    const config = cli(args);
    expect(config).toHaveProperty("version-everything");
    expect(config["version-everything"].files).toHaveLength(2);
  });

  test("Specify a package.json file", () => {
    process.chdir("./package");
    const args = { ...fakeYargs, packageJson: "package.json" };
    const config = cli(args);
    expect(config).toHaveProperty("version-everything");
    expect(config["version-everything"].files).toHaveLength(5);
  });

  test("empty version-everything object", () => {
    const args = { ...fakeYargs, "version-everything": {} };
    const config = cli(args);
    expect(config).toHaveProperty("version-everything");
    expect(config["version-everything"].files).toHaveLength(0);
  });

  test("Passes quiet flag in options", () => {
    const args = { ...fakeYargs, quiet: true };
    const config = cli(args);
    expect(config).toHaveProperty("version-everything");
    expect(config["version-everything"].options).toHaveProperty("quiet");
  });
});
