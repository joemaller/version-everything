const getPackageJson = require("../app/get-package-json");
const tmpFixture = require("./lib/tmp-fixture");

describe("Load a package.json file", () => {
  const cwd = process.cwd();
  const consoleLog = console.log;
  const stdoutWrite = process.stdout.write;

  // ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
  const cleanup = () => {
    process.chdir(cwd);
    console.log = consoleLog;
    process.stdout.write = stdoutWrite;
  };

  afterEach(cleanup);

  describe("find package.json", () => {
    test("Finds package.json in same dir", () => {
      process.chdir("./test/fixture/deep/dotfile/");
      const packageJson = getPackageJson({ quiet: true });
      expect(packageJson).toHaveProperty(
        "packageJson.name",
        "version-everything-test-fixture"
      );
      expect(packageJson).toHaveProperty("packageJson.version", "9.8.7");
    });

    test("Finds package.json climbing up from a subdir", () => {
      process.chdir("./test/fixture/deep/dotfile/deeper/and_deeper");
      const packageJson = getPackageJson({ quiet: true });
      expect(packageJson).toHaveProperty(
        "packageJson.name",
        "version-everything-test-fixture"
      );
      expect(packageJson).toHaveProperty("packageJson.version", "9.8.7");
    });

    test("Errors trying to find an ancestor package.json file", () => {
      process.chdir("/");
      expect(() => getPackageJson({ quiet: true })).toThrow();
    });
  });

  describe("load specific package.json file", () => {
    test("Load a specific package.json file", () => {
      const packageJson = getPackageJson({
        package_json: "./test/fixture/deep/dotfile/package.json",
        quiet: true,
      });
      expect(packageJson).toHaveProperty(
        "packageJson.name",
        "version-everything-test-fixture"
      );
      expect(packageJson).toHaveProperty("packageJson.version", "9.8.7");
    });
  });

  describe("test option to quiet output", () => {
    let output;

    beforeEach(() => {
      output = "";
      process.stdout.write = console.log = (str) => (output += str);
    });

    afterEach(cleanup);

    test("logs to stdout, quiet == false", () => {
      try {
        const packageJson = getPackageJson({ quiet: false });
        expect(output).not.toBe("");
        expect(packageJson).toHaveProperty("packageJson.version");
        cleanup();
      } catch (err) {
        cleanup();
        throw err;
      }
    });

    test("does its thing quietly, quiet == true", () => {
      try {
        const packageJson = getPackageJson({ quiet: true });
        expect(output).toBe("");
        expect(packageJson).toHaveProperty("packageJson.version");
        cleanup();
      } catch (err) {
        cleanup();
        throw err;
      }
    });

    test("is not quiet by default", () => {
      try {
        const packageJson = getPackageJson();
        expect(output).not.toBe("");
        expect(packageJson).toHaveProperty("packageJson.version");
        cleanup();
      } catch (err) {
        cleanup();
        throw err;
      }
    });
  });

  describe("Test invalid file errors", () => {
    const cwd = process.cwd();
    const fixtureDir = "./test/fixture/";

    beforeEach(() => {
      process.chdir(tmpFixture(fixtureDir));
    });

    afterEach(() => {
      process.chdir(cwd);
    });

    test("Errors trying to load a version-less package.json file", () => {
      process.chdir("./deep/dotfile/");
      const args = { package_json: "no-version.json" };
      expect(() => getPackageJson(args)).toThrow();
    });

    test("Errors trying to load a non-json text file", () => {
      process.chdir("./deep/dotfile/");
      const args = { package_json: "not-really-data.txt" };
      expect(() => getPackageJson(args)).toThrow();
    });

    test("No package.json", () => {
      process.chdir("./package-missing");
      expect(() => getPackageJson()).toThrow();
    });
  });
});
