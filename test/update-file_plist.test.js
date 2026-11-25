// @ts-check

import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import updateFile from "../app/update-file.js";
import tmpFixture from "./lib/tmp-fixture.js";

const newVersion = "3.14.1592";
const cwd = process.cwd();
const fixtureDir = "./test/fixtures";

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
    await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).not.toMatch(`<version>`);
    expect(actual).not.toMatch(`<version>3.14.1592</version>`);
    const pattern = new RegExp(
      `<key>Version</key>\\s*<string>${newVersion}</string>`,
    );
    expect(actual).toMatch(pattern);
  });

  test("bad plist file", async () => {
    const file = "invalid.plist";

    await expect(updateFile(file, newVersion, { quiet: true })).rejects.toThrow(
      "Unable to parse plist",
    );
  });

  test("plist with a non-dictionary root", async () => {
    const file = "array-root.plist";

    await expect(updateFile(file, newVersion, { quiet: true })).rejects.toThrow(
      "Unable to parse plist",
    );
  });
});
