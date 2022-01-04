// @ts-check
const fs = require("fs-extra");

const tmpFixture = require("./lib/tmp-fixture");
const updateFile = require("../app/update-file");

let newVersion = "3.14.1592";
const cwd = process.cwd();
const fixtureDir = "./test/fixture/deep/dotfile";

const consoleLog = console.log;

// ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
const cleanup = () => {
  console.log = consoleLog;
};

beforeEach(() => {
  const tmpFix = tmpFixture(fixtureDir);
  process.chdir(tmpFix);
});

afterEach(() => {
  process.chdir(cwd);
  cleanup();
});

describe("XML files", () => {
  test("should report the previous version (xml file)", async () => {
    const file = "file.xml";
    let output = "";
    console.log = (str) => (output += str);

    const result = await updateFile(file, newVersion, {});
    expect(result).toHaveProperty("oldVersion");
    expect(output).toMatch(result.oldVersion);
  });

  test("should increment the top-level version attribute in an xml file (async)", async () => {
    const file = "file.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = await fs.readFile(file);

    expect(actual.toString()).toMatch(`<version>${newVersion}</version>`);
  });

  test("Should not add a second version element if one already exists", async () => {
    const file = "file.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    expect(result).toHaveProperty("oldVersion");
    expect(result.data).not.toMatch(result.oldVersion);
  });

  test("Should not add a top-level version element if CData contains a version", async () => {
    const file = "comments.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();

    expect(actual).not.toMatch(`<version>${result.oldVersion}</version>`);
    expect(actual).not.toMatch(`<version>${newVersion}</version>`);
  });

  // TODO: specify something like {key: 'project_version'} to update that key with the version
  test.skip("should increment a top-level custom attribute in an xml file", () => {});

  // TODO: specify something like {key: 'config.project_version'} to update that key with the version
  test.skip("should increment a nested custom attribute in an xml file", () => {});
})
