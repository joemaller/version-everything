// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { resolve } from "path";

import tmpFixture from "./lib/tmp-fixture.js";
import parseArgs from "../app/parse-args.js";

const cwd = process.cwd();
const fixtureDir = "./test/fixtures";

const fakeYargs = { _: [], $0: "cli.js" };

describe("Test the CLI", () => {
  beforeEach(() => {
    process.chdir(tmpFixture(fixtureDir));
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  test("Call without args", () => {
    const config = parseArgs();
    expect(config).toEqual({});
  });

  test("Call with file list", () => {
    const args = { _: ["file1.js", "file2.txt"] };
    const config = parseArgs(args);
    expect(config.files).toHaveLength(2);
  });

  test("no arguments, pass empty object", () => {
    const args = { ...fakeYargs, "version-everything": {} };
    const config = parseArgs(args);
    expect(config).not.toHaveProperty("files");
  });

  test("Passes quiet flag", () => {
    const args = { ...fakeYargs, quiet: true };
    const config = parseArgs(args);
    expect(config).toHaveProperty("quiet");
  });

  test("Passes dry-run flag", () => {
    const args = { ...fakeYargs, "dry-run": true };
    const config = parseArgs(args);
    expect(config).toHaveProperty("dryRun");
  });

  test("Pass an array of prefixes", () => {
    const prefix = ["namespace/foo-img:", "foo/bar"];
    const args = { ...fakeYargs, prefix };
    const config = parseArgs(args);
    expect(config).toHaveProperty("prefixes", prefix);
  });

  test("resolve packageJson path", () => {
    const packageJson = "somefile.json";
    const args = { ...fakeYargs, packageJson };
    const config = parseArgs(args);
    const actual = resolve(packageJson);
    expect(config).toHaveProperty("packageJson", actual);
  });

  test("unknown options should fail", () => {
    const args = { ...fakeYargs, v: true };
    expect(parseArgs(args)).toThrow;
  });

  test("mixed unknown options should fail", () => {
    const args = { ...fakeYargs, dryRun: true, v: true };
    expect(parseArgs(args)).toThrow;
  });
});
