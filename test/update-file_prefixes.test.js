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

describe("Update prefixed versions", () => {
  test("should update prefixed versions (in a markdown Readme file)", async () => {
    const file = "readme-with-docker-image-tag.md";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["namespace/image-name:"],
    });
    const actual = (await fs.readFile(file)).toString();
    expect(result.data).not.toMatch(result.oldVersion);
    expect(actual).toMatch(newVersion);
  });

  test.skip("should update prefixed versions (docker-compose images)", () => {});

  test("should use a string prefix)", async () => {
    const file = "prefix-patterns.md";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["namespace-\\d+/img:"],
    });
    expect(result.data).not.toMatch("namespace-11/img:1.2.3");
    expect(result.data).toMatch("namespace/img:0.0.1");
  });

  test("should use a RegExp String prefix)", async () => {
    const file = "prefix-patterns.md";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["namespace-\\d+/img:"],
    });
    expect(result.data).not.toMatch("namespace-11/img:1.2.3");
    expect(result.data).toMatch("namespace/img:0.0.1");
  });

  test("should use a RegExp Literal prefix)", async () => {
    const file = "prefix-patterns.md";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: [/namespace-\d+\/img:/],
    });
    expect(result.data).not.toMatch("namespace-11/img:1.2.3");
    expect(result.data).toMatch("namespace/img:0.0.1");
  });

  test("should use a mixed array of string and RegExp prefixes)", async () => {
    const file = "prefix-patterns.md";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: [
        "namespace-11/img:",
        /namespace-2+\/img:/,
        "namespace-3+/img:",
      ],
    });
    expect(result.data).not.toMatch("namespace-11/img:1.2.3");
    expect(result.data).not.toMatch("namespace-22/img:2.3.4");
    expect(result.data).not.toMatch("namespace-33/img:5.6.7");
    expect(result.data).toMatch("namespace-4567/img:11.222.333");
    expect(result.data).toMatch("namespace/img:0.0.1");
  });

  test("should update multiple prefixes (in a markdown file)", async () => {
    const file = "multiple-prefixes.md";
    const prefixes = ["namespace-1/img:", "namespace-2/img:"];

    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes,
    });
    expect(result.data).not.toMatch(result.oldVersion);
    expect(result.data).toMatch(prefixes[0] + newVersion);
    expect(result.data).toMatch(prefixes[1] + newVersion);
    expect(result.data).not.toMatch("namespace-1/img:1.2.3");
  });

  // TODO: Add a fake docker image:tag to XML CData
  test.skip("should apply prefix matching to CData xml files", () => {});
});
