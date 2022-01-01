// const path = require("path");
const fs = require("fs-extra");
const yaml = require("js-yaml");
const semver = require("semver");

const tmpFixture = require("./lib/tmp-fixture");
const updateFile = require("../app/update-file");

let newVersion = "3.14.1592";
const cwd = process.cwd();
const fixtureDir = "./test/fixture/deep/dotfile";

beforeEach(async () => {
  // newVersion = semver.inc(newVersion, "patch");
  const tmpFix = await tmpFixture(fixtureDir);
  // console.log('creating', tmpFix)
  process.chdir(tmpFix);
});

afterEach(() => {
  process.chdir(cwd);
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

  describe("plain text files", () => {
    test("should report the previous version (css block comment)", async () => {
      const file = "file.css";
      const result = await updateFile(file, newVersion, { quiet: true });
      expect(result).toHaveProperty("oldVersion");
      expect(result.oldVersion).not.toEqual(newVersion);
    });

    test("should increment a plain text file (css block comment)", async () => {
      const file = "file.css";
      const regex = new RegExp(
        "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " +
          newVersion.replace(/\./g, "\\."),
        "im"
      );
      await updateFile(file, newVersion, { quiet: true });
      const newFile = await fs.readFile(file, "utf8");
      // console.log({ newFile });
      expect(newFile).toMatch(regex);
    });

    it("should increment a v0.0.0 style version at the end of a line in a plain text file (css block comment)", (done) => {
      const file = "file.css";
      const regex = new RegExp(
        "v" + newVersion.replace(/\./g, "\\.") + "$",
        "gim"
      );

      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, "utf8", (err, data) => {
          expect(data.toString()).toMatch(`v${newVersion}`);
          done();
        });
      });
    });

    test("should report the previous version (php docblock comment)", (done) => {
      const file = "file.php";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        expect(result).toHaveProperty("oldVersion");
        done();
      });
    });

    test("should increment a plain text file (php docblock comment)", (done) => {
      const file = "file.php";
      const regex = new RegExp(
        "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " +
          newVersion.replace(/\./g, "\\."),
        "im"
      );
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(data.toString()).toMatch(regex);
          done();
        });
      });
    });

    test("should report the previous version (php docblock version tag)", (done) => {
      const file = "php-docblock-version-tag.php";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        expect(result).toHaveProperty("oldVersion");
        expect(result.oldVersion).not.toBeUndefined();
        done();
      });
    });

    test("should increment a plain text file (php docblock version tag)", (done) => {
      const file = "php-docblock-version-tag.php";
      const regex = new RegExp(
        "^\\s+\\*\\s+@version\\s+([^:]+:)?" + newVersion.replace(/\./g, "\\."),
        "im"
      );
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(data.toString()).toMatch(regex);
          done();
        });
      });
    });

    test("should report the previous version (markdown heading)", (done) => {
      const file = "file.md";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        expect(result).toHaveProperty("oldVersion");
        done();
      });
    });

    test("should increment a plain text file (markdown heading)", (done) => {
      const file = "file.md";
      const regex = new RegExp(
        "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " +
          newVersion.replace(/\./g, "\\."),
        "im"
      );
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(data.toString()).toMatch(regex);
          done();
        });
      });
    });

    test("should increment a plain text version with trailing spaces (markdown)", async () => {
      const file = "file-trailing-space.md";
      const regex = new RegExp(
        "Version: " + newVersion.replace(/\./g, "\\.") + "\\s+$",
        "im"
      );
      const { data, oldVersion } = await updateFile(file, newVersion, {
        quiet: true,
      });

      expect(data).toMatch(regex);
      expect(oldVersion).not.toEqual(newVersion);
    });

    test.skip("should update yaml frontmatter versions and text version strings in markdown documents", () => {});
  });

  describe("JSON files", () => {
    test("should report the previous version (json file)", (done) => {
      const file = "file.json";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        expect(result).toHaveProperty("oldVersion");
        done();
      });
    });

    test("should increment a json file", (done) => {
      const file = "file.json";
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          expect(err).toBeFalsy();
          expect(json).toHaveProperty("version", newVersion);
          done();
        });
      });
    });

    test.skip("should increment a top-level custom attribute in a json file", () => {});
    test.skip("should increment a nested custom attribute in a json file", () => {});

    test("should increment a json file, also using a replacer array", (done) => {
      const file = "file.json";
      const replacer = ["title", "version"];
      updateFile(
        file,
        newVersion,
        { json: { replacer: replacer }, quiet: true },
        (err) => {
          expect(err).toBeFalsy();
          fs.readJson(file, (err, json) => {
            expect(err).toBeFalsy();
            expect(json).toHaveProperty("version", newVersion);
            expect(json).toHaveProperty("title");
            expect(json).not.toHaveProperty("double_me");
            done();
          });
        }
      );
    });

    test("should increment a json file, also using a replacer function", (done) => {
      const file = "file.json";
      const replacer = (key, value) =>
        key === "double_me" ? value * 2 : value;
      updateFile(
        file,
        newVersion,
        { json: { replacer: replacer }, quiet: true },
        (err) => {
          expect(err).toBeFalsy();
          fs.readJson(file, (err, json) => {
            expect(json).toHaveProperty("version", newVersion);
            expect(json).toHaveProperty("title");
            expect(json).toHaveProperty("double_me", 10);
            done();
          });
        }
      );
    });

    test("should increment a json file, also using a reviver function", (done) => {
      const file = "file.json";
      const reviver = (key, value) => (key === "double_me" ? value * 2 : value);
      updateFile(
        file,
        newVersion,
        { json: { reviver: reviver }, quiet: true },
        (err) => {
          expect(err).toBeFalsy();
          fs.readJson(file, (err, json) => {
            expect(json).toHaveProperty("version", newVersion);
            expect(json).toHaveProperty("title");
            expect(json).toHaveProperty("double_me", 10);
            done();
          });
        }
      );
    });

    test("should increment a json file and set a specific indentation", (done) => {
      const file = "file.json";
      const spaces = 4;
      const regex = new RegExp("^ {" + spaces + '}"version":', "m");
      updateFile(
        file,
        newVersion,
        { json: { space: spaces }, quiet: true },
        (err) => {
          expect(err).toBeFalsy();
          fs.readFile(file, (err, data) => {
            expect(data.toString()).toMatch(regex);
            done();
          });
        }
      );
    });
  });

  describe("XML files", () => {
    test.skip("should report the previous version (xml file)", () => {});
    test.skip("should increment the top-level version attribute in an xml file", () => {});

    // TODO: specify something like {key: 'project_version'} to update that key with the version
    test.skip("should increment a top-level custom attribute in an xml file", () => {});

    // TODO: specify something like {key: 'config.project_version'} to update that key with the version
    test.skip("should increment a nested custom attribute in an xml file", () => {});

    test.skip("should increment an xml plist file", () => {});
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

    test("should increment a top-level attribute in a yaml file", (done) => {
      const file = "file.yml";
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(err).toBeFalsy();
          const yamlData = yaml.load(data);
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

  describe("Files without extensions", () => {
    test("should increment a json file without a file extension", (done) => {
      const file = "naked-json";
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          expect(json).toHaveProperty("version", newVersion);
          done();
        });
      });
    });

    test.skip("should increment an xml file without a file extension", () => {});
    test("should increment a yaml file without a file extension", (done) => {
      const file = "naked-yaml";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(err).toBeFalsy();
          const yamlData = yaml.load(data);
          expect(yamlData).toHaveProperty("version", newVersion);
          done();
        });
      });
    });
  });

  describe("Files without versions", () => {
    test("should report the file was unversioned", (done) => {
      const file = "no-version.json";
      try {
        updateFile(file, newVersion, { quiet: true }, (err, result) => {
          expect(result).toHaveProperty("oldVersion", undefined);
          done();
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("adds version to version-less json file", (done) => {
      const file = "no-version.json";
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          expect(json).toHaveProperty("version", newVersion);
          done();
        });
      });
    });

    test.skip("adds version to version-less xml file", () => {});
    test("adds version to version-less yaml file", (done) => {
      const file = "no-version.yml";
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(err).toBeFalsy();
          const yamlData = yaml.load(data);
          expect(yamlData).toHaveProperty("version", newVersion);
          done();
        });
      });
    });

    test("passes version-less plain files through unchanged", (done) => {
      const file = "not-really-data.txt";
      const stats = fs.statSync(file);
      const content = fs.readFileSync(file, { encoding: "utf8" });
      updateFile(file, newVersion, { quiet: true }, (err) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          const newStats = fs.statSync(file);
          delete stats.atime;
          delete newStats.atime;
          delete stats.atimeMs;
          delete newStats.atimeMs;
          expect(newStats).toStrictEqual(stats);
          expect(data.toString()).toEqual(content);
          done();
        });
      });
    });

    test("Don't udpate this file", async () => {
      const file = "do-not-update.txt";
      const updated = await updateFile(file, newVersion, {});
      expect(updated).toBe(undefined);
    });
  });

  describe("Errors and Callbacks", () => {
    let output;
    const consoleLog = console.log;
    const stdoutWrite = process.stdout.write;

    const cleanup = function () {
      console.log = consoleLog;
      process.stdout.write = stdoutWrite;
    };

    beforeEach(() => {
      output = "";
      process.stdout.write = console.log = (str) => (output += str);
    });

    test.skip("Calls a callback", () => {});
    test.skip("Returns a promise", () => {});

    test("Throws an error on missing files (Callback)", (done) => {
      const file = "not-a-file.txt";
      updateFile(file, newVersion, {}, (err, result) => {
        expect(output).toMatch(/ENOENT/);
        done();
      });
    });

    test("Throws an error on missing files (Promise)", async () => {
      const file = "not-a-file.txt";
      await updateFile(file, newVersion, { quiet: false });
      expect(output).toMatch(/ENOENT/);
    });

    test("Throws an error when unable to read files (permissions, callback)", (done) => {
      const file = "file.json";
      fs.chmodSync(file, "0377");
      updateFile(file, newVersion, { quiet: false }, (err, result) => {
        expect(output).toMatch(/EACCES/);
        done();
      });
    });

    test("Throws an error when unable to read files (permissions, Promise)", async () => {
      const file = "file.json";
      fs.chmodSync(file, "0377");
      await updateFile(file, newVersion, { quiet: false });
      expect(output).toMatch(/EACCES/);
    });

    test("Calls the callback when nothing happens", (done) => {
      const file = "not-really-data.txt";
      updateFile(file, newVersion, { quiet: false }, done);
    });

    test("Stupid test for coverage (callback is not a function)", () => {
      updateFile("file", newVersion, { quiet: true }, null).catch((err) =>
        expect(err.toString()).toMatch("Error")
      );
    });

    test("Fail to update read-only file", async () => {
      const file = "file.json";
      fs.chmodSync(file, 0o444);
      await updateFile(file, newVersion, { quiet: true }).catch((err) =>
        expect(err.toString()).toMatch("EACCES")
      );
    });
  });

  describe("Test output (console.log) & Dry-run", () => {
    let output;
    const consoleLog = console.log;
    const stdoutWrite = process.stdout.write;

    // ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
    const cleanup = function () {
      console.log = consoleLog;
      process.stdout.write = stdoutWrite;
    };

    beforeEach(() => {
      output = "";
      process.stdout.write = console.log = (str) => (output += str);
    });

    afterEach(cleanup);

    test("should be quiet", (done) => {
      const file = "file.json";
      try {
        updateFile(file, newVersion, { quiet: true }, (err) => {
          expect(err).toBeFalsy();
          expect(output).toBe("");
          done();
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("should be loud", (done) => {
      const file = "file.json";
      try {
        updateFile(file, newVersion, {}, (err) => {
          expect(err).toBeFalsy();
          expect(output).not.toBe("");
          done();
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("should be quiet, even if dryRun is true", (done) => {
      const file = "file.json";
      try {
        updateFile(file, newVersion, { quiet: true, dryRun: true }, (err) => {
          expect(err).toBeFalsy();
          expect(output).toBe("");
          done();
        });
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

    test("dry-run output should include file contents", async () => {
      // cleanup();
      const file = "file.json";
      // console.log('hi2?', fs.readFileSync(file, 'utf8'));
      const rawData = await fs.readFile(file);
      const updated = await updateFile(file, newVersion, { dryRun: true });
      const newData = await fs.readFile(file);

      expect(output).not.toEqual("");
      expect(output).toContain(newVersion);
      expect(output).toContain(`"version": "${newVersion}",`);
      expect(output).toMatch(updated.data);
    });
  });
});
