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

describe("JSON files", () => {
  test("should report the previous version (json file)", async () => {
    const file = "file.json";
    let output = "";
    console.log = (str) => (output += str);

    const result = await updateFile(file, newVersion, { quiet: false });
    expect(result).toHaveProperty("oldVersion");
    expect(output).toMatch(newVersion);
    expect(output).toMatch(result.oldVersion);
  });

  test("should increment a json file", (done) => {
    const file = "file.json";
    updateFile(file, newVersion, { quiet: true }, (err) => {
      expect(err).toBeFalsy();
      fs.readJson(file, (err, json) => {
        expect(err).toBeFalsy();
        expect(json).toHaveProperty("version", newVersion);
        done();
      });
    });
  });

  test.skip("should increment a top-level custom attribute in a json file", () => {});
  test.skip("should increment a nested custom attribute in a json file", () => {});

  test("should increment a json file, also using a replacer array", (done) => {
    const file = "file.json";
    const replacer = ["title", "version"];
    updateFile(
      file,
      newVersion,
      { json: { replacer: replacer }, quiet: true },
      (err) => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          expect(err).toBeFalsy();
          expect(json).toHaveProperty("version", newVersion);
          expect(json).toHaveProperty("title");
          expect(json).not.toHaveProperty("double_me");
          done();
        });
      }
    );
  });

  test("should increment a json file, also using a replacer function", (done) => {
    const file = "file.json";
    const replacer = (key, value) => (key === "double_me" ? value * 2 : value);
    updateFile(
      file,
      newVersion,
      { json: { replacer: replacer }, quiet: true },
      (err) => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          expect(json).toHaveProperty("version", newVersion);
          expect(json).toHaveProperty("title");
          expect(json).toHaveProperty("double_me", 10);
          done();
        });
      }
    );
  });

  test("should increment a json file, also using a reviver function", (done) => {
    const file = "file.json";
    const reviver = (key, value) => (key === "double_me" ? value * 2 : value);
    updateFile(
      file,
      newVersion,
      { json: { reviver: reviver }, quiet: true },
      (err) => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          expect(json).toHaveProperty("version", newVersion);
          expect(json).toHaveProperty("title");
          expect(json).toHaveProperty("double_me", 10);
          done();
        });
      }
    );
  });

  test("should increment a json file and set a specific indentation", (done) => {
    const file = "file.json";
    const spaces = 4;
    const regex = new RegExp("^ {" + spaces + '}"version":', "m");
    updateFile(
      file,
      newVersion,
      { json: { space: spaces }, quiet: true },
      (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(data.toString()).toMatch(regex);
          done();
        });
      }
    );
  });

  test("should parse csscomb file and add version (issue #6)", async () => {
    const file = "csscomb-issue-6.json";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = JSON.parse((await fs.readFile(file)).toString());
    expect(result).toHaveProperty("oldVersion", undefined);
    expect(actual).toHaveProperty("version", newVersion);
  });
});
