// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { readFile } from "fs-extra";
import YAML from "yaml";

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

describe("YAML files", () => {
  test("should report the previous version (yaml file)", async () => {
    const file = "file.yml";
    const result = await updateFile(file, newVersion, { quiet: true }).catch(
      (err) => expect(err).toBeFalsy()
    );
    expect(result).toHaveProperty("oldVersion");
  });

  test("should report missing previous versions as undefined (yaml file)", async () => {
    const file = "no-version.yml";
    const result = await updateFile(file, newVersion, { quiet: true });
    expect(result).toHaveProperty("oldVersion", undefined);
  });

  test("should increment a top-level attribute in a yaml file", async () => {
    const file = "file.yml";
    await updateFile(file, newVersion, { quiet: true }).catch((err) =>
      expect(err).toBeFalsy()
    );
    const data = await readFile(file, "utf8");
    const yamlData = YAML.parse(data);
    expect(yamlData).toHaveProperty("version", newVersion);
  });

  test("should preserve comments in YAML files", async () => {
    const file = "prefix-no-version-docker-compose.yml";
    const result = await updateFile(file, newVersion, { quiet: true });
    expect(result.data).toMatch(/\s*# image:/gim);
    expect(result.data).toMatch(/\n\n/gim);
  });

  // TODO: specify something like {key: '_playbook_version'} to update that key with the version
  test.skip("should increment a top-level custom attribute in a yaml file", () => {});

  // TODO: specify something like {key: 'config.version'} to update that nested key with the version
  test.skip("should increment a nested custom attribute in a yaml file", () => {});
  test.skip("should increment a plain-text comment in a yaml file", () => {});
  test.skip("should increment yaml frontmatter in a markdown file", () => {});

  test("empty yaml file show throw", () => {
    const file = "empty.yml";
    expect(() =>
      updateFile(file, newVersion, { quiet: true })
    ).rejects.toThrowError("YAML.parse() returned null");
  });

  test("invalid yaml should throw", () => {
    const file = "invalid.yml";
    expect(() =>
      updateFile(file, newVersion, { quiet: true })
    ).rejects.toThrowError('Missing closing "quote');
  });
});
