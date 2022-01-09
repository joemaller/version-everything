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
    console.log = (str) => (output += str); // mock console.log

    const result = await updateFile(file, newVersion, {});
    expect(result).toHaveProperty("oldVersion");
    expect(output).toMatch(result.oldVersion);
  });

  test("should increment the root-level version attribute in an xml file", async () => {
    const file = "file.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = await fs.readFile(file);

    expect(actual.toString()).toMatch(`<version>${newVersion}</version>`);
  });

  test("should add root-level version attribute in an xml files without versions", async () => {
    const file = "no-version.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = await fs.readFile(file);

    expect(actual.toString()).toMatch(`<version>${newVersion}</version>`);
    expect(result.oldVersion).toBeUndefined;
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

  test("Should check empty CData (will be removed)", async () => {
    const file = "empty-cdata.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).not.toMatch(`<version>${result.oldVersion}</version>`);
    expect(actual).not.toMatch("<![CDATA[]]>");
  });

  test("Should check empty CData (whitespace is not empty)", async () => {
    const file = "empty-cdata-whitespace.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).not.toMatch(`<version>${result.oldVersion}</version>`);
    expect(actual).toMatch("<![CDATA[ ");
    expect(actual).toMatch(" ]]>");
  });

  test("should add a version to an empty Version element", async () => {
    const file = "empty-version.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}</version>`);
    expect(result.oldVersion).toBeUndefined();
  });

  test("should add a version to an empty Version element", async () => {
    const file = "empty-version-self-closing.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}</version>`);
    expect(result.oldVersion).toBeUndefined();
  });

  test("should update a version despite an extra element", async () => {
    const file = "version-with-extra-element.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}`);
    expect(actual).toMatch(/<extra\s*\/>/);
  });

  // TODO: specify something like {key: 'project_version'} to update that key with the version
  test.skip("should increment a top-level custom attribute in an xml file", () => {});

  // TODO: specify something like {key: 'config.project_version'} to update that key with the version
  test.skip("should increment a nested custom attribute in an xml file", () => {});
});
