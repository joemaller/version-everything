// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import fs from "fs-extra";

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
  test("should apply prefix matching to CData xml files", async () => {
    const file = "cdata-with-prefix.xml";
    const prefix = "namespace/img:";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: [prefix],
    });
    expect(result.data).not.toMatch(result.oldVersion);
    expect(result.data).not.toMatch("1.2.3");
    expect(result.data).toMatch(`${prefix}${newVersion}`);
  });

  test("should replace prefixed value in xml as plain text", async () => {
    const file = "prefix-no-version.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["constellation/list:"],
    });
    expect(result.data).not.toMatch("constellation/list:299.792.458");
    expect(result.data).toMatch("constellation/list:" + newVersion);
    expect(result.data).not.toMatch("<version>");
  });

  test("should update normal XML versions when prefix doesn't find a match", async () => {
    const file = "file.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["constellation/list:"],
    });
    expect(result).toHaveProperty("oldVersion");
    expect(result.data).not.toMatch(result.oldVersion);
  });

  test("should add missing versions to XML when prefix doesn't find a match", async () => {
    const file = "no-version.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["constellation/list:"],
    });
    expect(result).toHaveProperty("oldVersion");
    expect(result.data).toMatch("<version>");
  });

  test("should replace prefixed value in JSON as plain text", async () => {
    const file = "prefix-no-version.json";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["constellation/list:"],
    });
    const actual = JSON.parse(result.data);
    expect(result.data).not.toMatch("constellation/list:299.792.458");
    expect(result.data).toMatch("constellation/list:" + newVersion);
    expect(actual).not.toHaveProperty("version");
  });

  test("should replace prefixed versions in Yaml as plain text (docker-compose files)", async () => {
    const file = "prefix-no-version-docker-compose.yml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      prefixes: ["namespace/img:"],
    });
    expect(result.data).not.toMatch("namespace/img:4.3.2");
    expect(result.data).toMatch("namespace/img:dev");
    expect(result.data).toMatch("namespace/img:" + newVersion);
    expect(result.data).not.toMatch(
      new RegExp(`\\s*version:\\s+${newVersion}`)
    );
  });
});
