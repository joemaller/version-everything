// @ts-check

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { readFile, readJson } from "fs-extra";

import tmpFixture from "./lib/tmp-fixture.js";
import updateFile from "../app/update-file.js";

let newVersion = "3.14.1592";
const cwd = process.cwd();
const fixtureDir = "./test/fixtures";

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

  test("should increment a json file", async () => {
    const file = "file.json";
    await updateFile(file, newVersion, { quiet: true }).catch((err) =>
      expect(err).toBeFalsy()
    );
    const json = await readJson(file);
    expect(json).toHaveProperty("version", newVersion);
  });

  test.skip("should increment a top-level custom attribute in a json file", () => {});
  test.skip("should increment a nested custom attribute in a json file", () => {});

  test("should increment a json file, also using a replacer array", async () => {
    const file = "file.json";
    const replacer = ["title", "version"];
    await updateFile(file, newVersion, {
      json: { replacer: replacer },
      quiet: true,
    }).catch((err) => expect(err).toBeFalsy());
    const json = await readJson(file);
    expect(json).toHaveProperty("version", newVersion);
    expect(json).toHaveProperty("title");
    expect(json).not.toHaveProperty("double_me");
  });

  test("should increment a json file, also using a replacer function", async () => {
    const file = "file.json";
    const replacer = (key, value) => (key === "double_me" ? value * 2 : value);
    await updateFile(file, newVersion, {
      json: { replacer: replacer },
      quiet: true,
    }).catch((err) => expect(err).toBeFalsy());

    const json = await readJson(file);
    expect(json).toHaveProperty("version", newVersion);
    expect(json).toHaveProperty("title");
    expect(json).toHaveProperty("double_me", 10);
  });

  test("should increment a json file, also using a reviver function", async () => {
    const file = "file.json";
    const reviver = (key, value) => (key === "double_me" ? value * 2 : value);
    await updateFile(file, newVersion, {
      json: { reviver: reviver },
      quiet: true,
    }).catch((err) => expect(err).toBeFalsy());
    const json = await readJson(file);
    expect(json).toHaveProperty("version", newVersion);
    expect(json).toHaveProperty("title");
    expect(json).toHaveProperty("double_me", 10);
  });

  test("should increment a json file and set a specific indentation", async () => {
    const file = "file.json";
    const spaces = 4;
    const regex = new RegExp("^ {" + spaces + '}"version":', "m");
    await updateFile(file, newVersion, {
      json: { space: spaces },
      quiet: true,
    }).catch((err) => expect(err).toBeFalsy());

    const data = await readFile(file);
    expect(data.toString()).toMatch(regex);
  });

  test("should parse csscomb file and add version (issue #6)", async () => {
    const file = "csscomb-issue-6.json";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = JSON.parse((await readFile(file)).toString());
    expect(result).toHaveProperty("oldVersion", undefined);
    expect(actual).toHaveProperty("version", newVersion);
  });

  test("new json options should be merged over defaults", async () => {
    const file = "package.json";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      json: { thing: 1 },
    });
    expect(result.data).toMatch('{\n  "');
  });

  test("should sort package.json when sort:true in json options ", async () => {
    const file = "unsorted-package.json";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      json: { sort: true },
    });
    expect(result.data).toMatch(/\{\s*"name/);
    expect(Object.keys(JSON.parse(result.data))[0]).toBe("name");
  });
});
