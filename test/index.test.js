// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { readJSON } from "fs-extra";
import { readPackageUp } from "read-pkg-up";

import versionEverything from "../index.js";
import updateFile from "../app/update-file.js";
import log from "../app/lib/log-init.js";

/**
 * utility vars for checking arguments sent to updateFile
 */
let options = null;
let newVersion = "";

/**
 * Set up mocks for  updateFile, logInit (console.log)
 */
vi.mock("../app/update-file.js", () => ({
  default: vi.fn((f, v, o) => {
    newVersion = v;
    options = { ...o };
    // console.log("update-file mock", { f, v, o });
  }),
}));
const consoleMock = vi.fn();
vi.mock("../app/lib/log-init.js", () => ({
  default: vi.fn(() => consoleMock),
}));

describe("Index file tests", () => {
  beforeEach(async () => {
    newVersion = "";
    options = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("get version from package.json", async () => {
    const { packageJson: pkg } = await readPackageUp({ normalize: false });
    const files = ["fake.js", "fake2.json"];
    versionEverything({ files });
    expect(newVersion).toEqual(pkg.version);
    expect(updateFile).toHaveBeenCalledTimes(files.length);
    expect(log).toHaveBeenCalled();
    expect(consoleMock).toHaveBeenCalledWith(
      `Current version is "${pkg.version}"`
    );
  });

  test("manually specify version string", () => {
    const version = "11.22.33";
    const files = ["version.json"];
    versionEverything({ files, version });
    expect(newVersion).toEqual(version);
  });

  test("Remap Prefix to Prefixes", () => {
    const files = ["README.md"];
    const prefix = ["namespace/img:"];
    versionEverything({ files, prefix });
    expect(options).toHaveProperty("prefixes");
  });

  test("convert string prefix to array", () => {
    const files = ["README.md"];
    const prefix = "namespace/img:";
    versionEverything({ files, prefix });
    expect(options).toHaveProperty("prefixes", [prefix]);
  });

  test("convert string prefixes to array", () => {
    const files = ["README.md"];
    const prefixes = "namespace/img:";
    versionEverything({ files, prefixes });
    expect(options).toHaveProperty("prefixes", [prefixes]);
  });

  test("merge prefix and prefixes (strings)", () => {
    const files = ["README.md"];
    const prefix = "prefix1:";
    const prefixes = "prefix2:";
    versionEverything({ files, prefix, prefixes });
    expect(options.prefixes.sort()).toEqual([prefix, prefixes].sort());
  });

  test("merge prefix and prefixes (arrays)", () => {
    const files = ["README.md"];
    const prefix = ["prefix1:"];
    const prefixes = ["prefix2:"];
    versionEverything({ files, prefix, prefixes });
    expect(options.prefixes.sort()).toEqual([...prefix, ...prefixes].sort());
  });

  test("merge prefix and prefixes (mixed)", () => {
    const files = ["README.md"];
    const prefix = "prefix1:";
    const prefixes = ["prefix2:"];
    versionEverything({ files, prefix, prefixes });
    expect(options.prefixes.sort()).toEqual([prefix, ...prefixes].sort());
  });

  test("no files", () => {
    versionEverything();
    expect(updateFile).not.toHaveBeenCalled();
  });

  test("specify package.json file", async () => {
    const files = ["README.md"];
    const packageJson = "./test/fixtures/package-empty/package.json";
    const pkg = await readJSON(packageJson);
    versionEverything({ packageJson, files });
    expect(newVersion).toEqual(pkg.version);
    expect(pkg).toHaveProperty("version");
  });

  test("Missing Version", () => {
    const files = ["README.md"];
    const packageJson = "./test/fixtures/package-missing/not-package.json";
    expect(() => versionEverything({ packageJson, files })).toThrow();
  });

  test("Invalid SemVer version string (null)", () => {
    const files = ["README.md"];
    const version = "1.2.3.4.5.6";
    const packageJson = "./test/fixtures/package-empty/package.json";
    expect(() => versionEverything({ packageJson, files, version })).toThrow();
  });

  test("Invalid SemVer version string (args)", () => {
    const files = ["README.md"];
    const version = "1.2.3.4.5.6";
    const packageJson = "./test/fixtures/package-empty/package.json";
    expect(() => versionEverything({ packageJson, files, version })).toThrow();
  });

  test("Invalid SemVer version string (package)", () => {
    const files = ["README.md"];
    const packageJson = "./test/fixtures/package-invalid-version/package.json";
    expect(() => versionEverything({ packageJson, files })).toThrow();
  });

  test("Do nothing when args is false", () => {
    versionEverything(false);
    expect(log).not.toHaveBeenCalled();
  });

  test("Run normally when args is true", () => {
    versionEverything(true);
    expect(log).toHaveBeenCalled();
  });
});
