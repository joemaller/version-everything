// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import fs from "fs-extra";
import YAML from "yaml";

import tmpFixture from "./lib/tmp-fixture.js";
import updateFile from "../app/update-file.js";

let newVersion = "3.14.1592";
const cwd = process.cwd();
const fixtureDir = "./test/fixtures";

const consoleLog = console.log;
const stdoutWrite = process.stdout.write;

// ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
const cleanup = () => {
  console.log = consoleLog;
  process.stdout.write = stdoutWrite;
};

beforeEach(async () => {
  const tmpFix = await tmpFixture(fixtureDir);
  process.chdir(tmpFix);
  vi.useFakeTimers();
});

afterEach(() => {
  process.chdir(cwd);
  cleanup();
});

describe("Update a file", () => {
  test("requires a file argument", () => {
    updateFile().catch((err) => expect(err.toString()).toMatch("Error"));
  });

  test("requires a version string argument", () => {
    updateFile("file").catch((err) => expect(err.toString()).toMatch("Error"));
  });

  test("should fail if options is not an object", async () => {
    await expect(updateFile("file", "1.2.3", false)).rejects.toThrow(
      "Options should be an object"
    );
    await expect(updateFile("file", "1.2.3", [])).rejects.toThrow(
      "Options should be an object"
    );
    await expect(updateFile("file", "1.2.3", [""])).rejects.toThrow(
      "Options should be an object"
    );
    await expect(updateFile("file", "1.2.3", "hello")).rejects.toThrow(
      "Options should be an object"
    );
  });

  test.skip("accepts a string file path", () => {});
  test.skip("accepts a filestream", () => {});

  describe("Plist files", () => {
    test.skip("should increment a plist file", () => {});
    test.skip("should add a Version element to a plist file", () => {});
  });

  describe("Files without extensions", () => {
    test("should increment a json file without a file extension", async () => {
      const file = "naked-json";
      await updateFile(file, newVersion, { quiet: true }).catch((err) =>
        expect(err).toBeFalsy()
      );

      const json = await fs.readJson(file);
      expect(json).toHaveProperty("version", newVersion);
    });

    test("should increment an xml file without a file extension", async () => {
      const file = "naked-xml";
      const result = await updateFile(file, newVersion, { quiet: true });
      const actual = (await fs.readFile(file)).toString();
      expect(result).toHaveProperty("oldVersion");
      expect(result.oldVersion).not.toMatch(newVersion);
      expect(actual).toMatch(newVersion);
    });

    test("should increment a yaml file without a file extension", async () => {
      const file = "naked-yaml";
      await updateFile(file, newVersion, { quiet: true }).catch(async (err) =>
        expect(err).toBeFalsy()
      );
      const yamlData = YAML.parse(await fs.readFile(file, "utf8"));
      expect(yamlData).toHaveProperty("version", newVersion);
    });
  });

  describe("Files without versions", () => {
    test("should report the file was un-versioned", async () => {
      const file = "no-version.json";
      const result = await updateFile(file, newVersion, { quiet: true }).catch(
        (err) => expect(err).toBeFalsy()
      );
      expect(result).toHaveProperty("oldVersion", undefined);
    });

    test("adds version to version-less json file", async () => {
      const file = "no-version.json";
      await updateFile(file, newVersion, { quiet: true }).catch((err) =>
        expect(err).toBeFalsy()
      );
      const json = await fs.readJson(file);
      expect(json).toHaveProperty("version", newVersion);
    });

    test("adds version to version-less xml file", async () => {
      const file = "no-version.xml";
      const result = await updateFile(file, newVersion, { quiet: true });
      const actual = await fs.readFile(file);
      expect(actual.toString()).toMatch(`<version>${newVersion}</version>`);
      expect(result).toHaveProperty("oldVersion", undefined);
    });

    test("adds version to version-less yaml file", async () => {
      const file = "no-version.yml";
      const result = await updateFile(file, newVersion, { quiet: true });
      const actual = YAML.parse(await fs.readFile(file, "utf8"));
      expect(actual).toHaveProperty("version", newVersion);
      expect(result).toHaveProperty("oldVersion", undefined);
    });

    test("passes version-less plain files through unchanged", async () => {
      const file = "not-really-data.txt";
      const stats = await fs.stat(file);
      const content = await fs.readFile(file, { encoding: "utf8" });
      await updateFile(file, newVersion, { quiet: true }).catch((err) =>
        expect(err).toBeFalsy()
      );
      const data = await fs.readFile(file);
      const newStats = await fs.stat(file);
      delete stats.atime;
      delete newStats.atime;
      delete stats.atimeMs;
      delete newStats.atimeMs;
      expect(newStats).toStrictEqual(stats);
      expect(data.toString()).toEqual(content);
    });

    test("Don't update this file", async () => {
      const file = "do-not-update.txt";
      const updated = await updateFile(file, newVersion, {});
      expect(updated).toBe(undefined);
    });
  });

  describe("Errors and Callbacks", () => {
    let output;

    beforeEach(() => {
      output = "";
      process.stdout.write = console.log = (str) => (output += str);
    });

    test.skip("Calls a callback", () => {});
    test.skip("Returns a promise", () => {});

    test("Throws an error on missing files (Callback)", () => {
      const file = "not-a-file.txt";
      updateFile(file, newVersion, {}).catch((err) =>
        expect(output).toMatch(/ENOENT/)
      );
    });

    test("Throws an error on missing files (Promise)", async () => {
      const file = "not-a-file.txt";
      await updateFile(file, newVersion, { quiet: false });
      expect(output).toMatch(/ENOENT/);
    });

    // test("Throws an error when unable to read files (permissions, callback)", () =>
    //   new Promise((done) => {
    //     const file = "file.json";
    //     fs.fs.chmodSync(file, "0377");
    //     updateFile(file, newVersion, { quiet: false }, (err, result) => {
    //       expect(output).toMatch(/EACCES/);
    //       done();
    //     });
    //   }));

    test("Throws an error when unable to read files (permissions, Promise)", async () => {
      const file = "file.json";
      await fs.chmod(file, "0377");
      await updateFile(file, newVersion, { quiet: false });
      expect(output).toMatch(/EACCES/);
    });

    test("Fulfills the promise when nothing happens", async () => {
      const file = "not-really-data.txt";
      await updateFile(file, newVersion, { quiet: false });
    });

    test("Stupid test for coverage (callback is not a function)", () => {
      updateFile("file", newVersion, { quiet: true }, null).catch((err) =>
        expect(err.toString()).toMatch("Error")
      );
    });

    test("Fail to update read-only file", async () => {
      const file = "file.json";
      await fs.chmod(file, 0o444);
      await updateFile(file, newVersion, { quiet: true }).catch((err) =>
        expect(err.toString()).toMatch("EACCES")
      );
    });
  });

  describe("Test output (console.log) & Dry-run", () => {
    let output;

    beforeEach(() => {
      output = "";
      console.log = (str) => (output += str);
    });

    test("should be quiet", async () => {
      const file = "file.json";
      const result = await updateFile(file, newVersion, { quiet: true });
      expect(output).toBe("");
      expect(result.oldVersion).not.toBe(undefined);
    });

    test("should be loud", async () => {
      const file = "file.json";
      try {
        await updateFile(file, newVersion, {}).catch((err) => {
          expect(err).toBeFalsy();
          expect(output).not.toBe("");
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("should be quiet, even if dryRun is true", async () => {
      const file = "file.json";
      try {
        await updateFile(file, newVersion, { quiet: true, dryRun: true }).catch(
          (err) => {
            expect(err).toBeFalsy();
            expect(output).toBe("");
          }
        );
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("shows the file, current version and updated version", () => {
      const file = "file.json";
      return updateFile(file, newVersion, {})
        .then((result) => {
          expect(output).toEqual(expect.stringContaining(file));
          expect(output).toEqual(expect.stringContaining(newVersion));
          expect(output).toEqual(expect.stringContaining(result.oldVersion));
        })
        .catch((err) => expect(err).toBeFalsy());
    });

    test("dry-run should not change source file", async () => {
      const file = "file.json";
      const rawData = await fs.readFile(file, "utf8");
      const newData = await fs.readFile(file, "utf8");
      expect(newData).toEqual(rawData);
    });

    test("dry-run should not change the source file", async () => {
      const file = "file.json";
      const before = (await fs.readFile(file)).toString();
      await updateFile(file, newVersion, { dryRun: true });
      const after = (await fs.readFile(file)).toString();
      expect(before).toEqual(after);
    });

    test("dry-run output should change message", async () => {
      const file = "file.json";
      await updateFile(file, newVersion, { dryRun: true });
      expect(output).toMatch("dry run");
      expect(output).not.toMatch(/^Updated/gim);
    });
  });
});
