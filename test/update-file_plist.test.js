// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { readFile } from "fs-extra";

import tmpFixture from "./lib/tmp-fixture.js";
import updateFile from "../app/update-file.js";

let newVersion = "3.14.1592";
const cwd = process.cwd();
const fixtureDir = "./test/fixtures";

// const consoleLog = console.log;

// ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
// const cleanup = () => {
//   console.log = consoleLog;
// };

beforeEach(() => {
  const tmpFix = tmpFixture(fixtureDir);
  process.chdir(tmpFix);
});

afterEach(() => {
  process.chdir(cwd);
});

describe("plist files", () => {
  test("should report the previous version (xml file)", async () => {
    const file = "sample.plist";
    const result = await updateFile(file, newVersion, { quiet: true });
    expect(result).toHaveProperty("oldVersion");
    expect(result.data).not.toMatch(result.oldVersion);
  });

  test("should update version key in plist files when no keys provided", async () => {
    const file = "sample.plist";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await readFile(file)).toString();
    expect(actual).not.toMatch(`<version>`);
    expect(actual).not.toMatch(`<version>3.14.1592</version>`);
    const pattern = new RegExp(
      `<key>Version</key>\\s*<string>${newVersion}</string>`
    );
    expect(actual).toMatch(pattern);
  });

  test("bad plist file", async () => {
    const file = "invalid.plist";

    // await updateFile(file, newVersion, { quiet: true })
    await expect(() =>
      updateFile(file, newVersion, { quiet: true })
    ).rejects.toThrowError("Unable to parse plist");
  });
});
