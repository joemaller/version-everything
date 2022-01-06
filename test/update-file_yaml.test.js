// @ts-check
const fs = require("fs-extra");
const yaml = require("js-yaml");

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

describe("YAML files", () => {
  test("should report the previous version (yaml file)", (done) => {
    const file = "file.yml";
    updateFile(file, newVersion, { quiet: true }, (err, result) => {
      expect(err).toBeFalsy();
      expect(result).toHaveProperty("oldVersion");
      done();
    });
  });

  test("should report missing previous versions as undefined (yaml file)", async () => {
    const file = "no-version.yml";
    const result = await updateFile(file, newVersion, { quiet: true });
    expect(result).toHaveProperty("oldVersion", undefined);
  });

  test("should increment a top-level attribute in a yaml file", (done) => {
    const file = "file.yml";
    updateFile(file, newVersion, { quiet: true }, (err) => {
      expect(err).toBeFalsy();
      fs.readFile(file, (err, data) => {
        expect(err).toBeFalsy();
        const yamlData = yaml.load(data.toString());
        expect(yamlData).toHaveProperty("version", newVersion);
        done();
      });
    });
  });

  // TODO: specify something like {key: '_playbook_version'} to update that key with the version
  test.skip("should increment a top-level custom attribute in a yaml file", () => {});

  // TODO: specify something like {key: 'config.version'} to update that nested key with the version
  test.skip("should increment a nested custom attribute in a yaml file", () => {});

  // it("should increment a plain-text comment in a yaml file");  // Is this really doable or necessary?
  test.skip("should increment yaml frontmatter in a markdown file", () => {});
});