/* eslint-env node,mocha */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/


const should = require("chai").should();

const fs = require("fs-extra");
const yaml = require("js-yaml");
const semver = require("semver");

const tmpFixture = require("../app/lib/tmp-fixture");
const updateFile = require("../app/update-file");

describe("Update a file", () => {
  let newVersion = "1.0.0";
  const cwd = process.cwd();
  const fixtureDir = "./test/fixture/deep/dotfile";

  beforeEach(() => {
    newVersion = semver.inc(newVersion, "patch");
    process.chdir(tmpFixture(fixtureDir));
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  test("requires a file argument", () => {
    const file = function() {
      updateFile();
    };
    file.should.throw(Error);
  });

  test("requires a version string argument", () => {
    const file = function() {
      updateFile("foo.file");
    };
    file.should.throw(Error);
  });

  test.skip("accepts a string file path", () => {});
  test.skip("accepts a filestream", () => {});

  describe("plain text files", () => {
    test("should report the previous version (css block comment)", done => {
      const file = "file.css";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        result.should.have.property("oldVersion");
        result.should.have
          .property("oldVersion")
          .that.is.not.string(newVersion);
        result.should.have.property("oldVersion").that.is.not.undefined;
        done();
      });
    });

    test("should increment a plain text file (css block comment)", done => {
      const file = "file.css";
      const regex = new RegExp(
        "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " +
          newVersion.replace(/\./g, "\\."),
        "im"
      );
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

    it("should increment a v0.0.0 style version at the end of a line in a plain text file (css block comment)", (done) => {
      const file = "file.css";
      const regex = new RegExp(
        "v" + newVersion.replace(/\./g, "\\.") + "$",
        "gim"
      );

      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(data.toString()).toMatch(regex);
          done();
        });
      });
    });

    test("should report the previous version (php docblock comment)", done => {
      const file = "file.php";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        result.should.have.property("oldVersion");
        done();
      });
    });

    test("should increment a plain text file (php docblock comment)", done => {
      const file = "file.php";
      const regex = new RegExp(
        "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " +
          newVersion.replace(/\./g, "\\."),
        "im"
      );
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

    test("should report the previous version (php docblock version tag)", done => {
      const file = "php-docblock-version-tag.php";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        result.should.have.property("oldVersion").that.is.not.undefined;
        done();
      });
    });

    test("should increment a plain text file (php docblock version tag)", done => {
      const file = "php-docblock-version-tag.php";
      const regex = new RegExp(
        "^\\s+\\*\\s+@version\\s+([^:]+:)?" + newVersion.replace(/\./g, "\\."),
        "im"
      );
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

    test("should report the previous version (markdown heading)", done => {
      const file = "file.md";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        result.should.have.property("oldVersion");
        done();
      });
    });

    test("should increment a plain text file (markdown heading)", done => {
      const file = "file.md";
      const regex = new RegExp(
        "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " +
          newVersion.replace(/\./g, "\\."),
        "im"
      );
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

    test.skip("should update yaml frontmatter versions and text version strings in markdown documents", () => {});
    test("should update several version strings in the same file", done => {
      const file = "decoy-version.md";
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          data.toString().should.have.string("## Version: " + newVersion);
          data.toString().should.have.string("### Version " + newVersion);
          done();
        });
      });
    });

    test("should not update non-version titles that look like versions", done => {
      const file = "decoy-version.md";
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          data.toString().should.have.string("# Version decoy file");
          done();
        });
      });
    });
  });

  describe("JSON files", () => {
    test("should report the previous version (json file)", done => {
      const file = "file.json";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        result.should.have.property("oldVersion");
        done();
      });
    });

    test("should increment a json file", done => {
      const file = "file.json";
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          expect(err).toBeFalsy();
          json.should.have.property("version", newVersion);
          done();
        });
      });
    });

    test.skip("should increment a top-level custom attribute in a json file", () => {});
    test.skip("should increment a nested custom attribute in a json file", () => {});

    test("should increment a json file, also using a replacer array", done => {
      const file = "file.json";
      const replacer = ["title", "version"];
      updateFile(
        file,
        newVersion,
        { json: { replacer: replacer }, quiet: true },
        err => {
          expect(err).toBeFalsy();
          fs.readJson(file, (err, json) => {
            expect(err).toBeFalsy();
            json.should.have.property("version", newVersion);
            json.should.have.property("title");
            json.should.not.have.property("double_me");
            done();
          });
        }
      );
    });

    test("should increment a json file, also using a replacer function", done => {
      const file = "file.json";
      const replacer = (key, value) =>
        key === "double_me" ? value * 2 : value;
      updateFile(
        file,
        newVersion,
        { json: { replacer: replacer }, quiet: true },
        err => {
          expect(err).toBeFalsy();
          fs.readJson(file, (err, json) => {
            json.should.have.property("version", newVersion);
            json.should.have.property("title");
            json.should.have.property("double_me", 10);
            done();
          });
        }
      );
    });

    test("should increment a json file, also using a reviver function", done => {
      const file = "file.json";
      const reviver = (key, value) => (key === "double_me" ? value * 2 : value);
      updateFile(
        file,
        newVersion,
        { json: { reviver: reviver }, quiet: true },
        (err, result) => {
          expect(err).toBeFalsy();
          fs.readJson(file, (err, json) => {
            json.should.have.property("version", newVersion);
            json.should.have.property("title");
            json.should.have.property("double_me", 10);
            done();
          });
        }
      );
    });

    test("should increment a json file and set a specific indentation", done => {
      const file = "file.json";
      const spaces = 4;
      const regex = new RegExp("^ {" + spaces + '}"version":', "m");
      updateFile(
        file,
        newVersion,
        { json: { space: spaces }, quiet: true },
        (err, result) => {
          expect(err).toBeFalsy();
          fs.readFile(file, (err, data) => {
            data.toString().should.match(regex);
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
    test("should report the previous version (yaml file)", done => {
      const file = "file.yml";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        result.should.have.property("oldVersion");
        done();
      });
    });

    test("should increment a top-level attribute in a yaml file", done => {
      const file = "file.yml";
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(err).toBeFalsy();
          const yamlData = yaml.safeLoad(data);
          yamlData.should.have.property("version", newVersion);
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
    test("should increment a json file without a file extension", done => {
      const file = "naked-json";
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          json.should.have.property("version", newVersion);
          done();
        });
      });
    });

    test.skip("should increment an xml file without a file extension", () => {});
    test("should increment a yaml file without a file extension", done => {
      const file = "naked-yaml";
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(err).toBeFalsy();
          const yamlData = yaml.safeLoad(data);
          yamlData.should.have.property("version", newVersion);
          done();
        });
      });
    });
  });

  describe("Files without versions", () => {
    test("should report the file was unversioned", done => {
      const file = "no-version.json";
      try {
        updateFile(file, newVersion, { quiet: true }, (err, result) => {
          result.should.have.property("oldVersion");
          result.should.have.property("oldVersion").that.is.undefined;
          done();
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("adds version to version-less json file", done => {
      const file = "no-version.json";
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readJson(file, (err, json) => {
          json.should.have.property("version", newVersion);
          done();
        });
      });
    });

    test.skip("adds version to version-less xml file", () => {});
    test("adds version to version-less yaml file", done => {
      const file = "no-version.yml";
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          expect(err).toBeFalsy();
          const yamlData = yaml.safeLoad(data);
          expect(yamlData).toHaveProperty("version", newVersion);
          // yamlData.should.have.property("version", newVersion);
          done();
        });
      });
    });

    test("passes version-less plain files through unchanged", done => {
      const file = "not-really-data.txt";
      const stats = fs.statSync(file);
      const content = fs.readFileSync(file, { encoding: "utf8" });
      updateFile(file, newVersion, { quiet: true }, err => {
        expect(err).toBeFalsy();
        fs.readFile(file, (err, data) => {
          const newStats = fs.statSync(file);
          delete stats.atime;
          delete newStats.atime;
          delete stats.atimeMs;
          delete newStats.atimeMs;
          expect(newStats).toStrictEqual(stats);
          data.toString().should.equal(content);
          done();
        });
      });
    });
  });

  describe("Errors and Callbacks", () => {
    test("Throws an error on missing files", done => {
      const file = "not-a-file.txt";
      updateFile(file, newVersion, {}, (err, result) => {
        // err.should.be.instanceOf(Error);
        expect(err.code).toBe("ENOENT");
        done();
      });
    });

    test("Throws an error when unable to read files (permissions)", done => {
      const file = "file.json";
      fs.chmodSync(file, "0377");
      updateFile(file, newVersion, { quiet: true }, (err, result) => {
        // expect(err).toBeInstanceOf(Error);
        expect(err.code).toBe("EACCES");
        done();
      });
    });

    test("Calls the callback when nothing happens", done => {
      const file = "not-really-data.txt";
      updateFile(file, newVersion, { quiet: false }, done);
      // updateFile(file, newVersion, { quiet: false }, () => {
      //   done();
      // });
      // try {
      //   updateFile(file, newVersion, { quiet: false }, (err, result) => {
      //     arguments.should.have.lengthOf(1);
      //     done();
      //   });
      // } catch (err) {
      //   expect(err).toBeFalsy();
      // }
    });
  });

  describe("Test output (console.log)", () => {
    let output;
    const consoleLog = console.log;
    const stdoutWrite = process.stdout.write;
    console.log(cwd);

    // ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
    const cleanup = function() {
      console.log = consoleLog;
      process.stdout.write = stdoutWrite;
    };

    beforeEach(() => {
      output = "";
      process.stdout.write = console.log = str => (output += str);
    });

    afterEach(cleanup);

    test("should be quiet", done => {
      const file = "file.json";
      try {
        updateFile(file, newVersion, { quiet: true }, err => {
          expect(err).toBeFalsy();
          output.should.be.empty;
          done();
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
      cleanup();
    });

    test("should be loud", done => {
      const file = "file.json";
      try {
        updateFile(file, newVersion, {}, err => {
          expect(err).toBeFalsy();
          output.should.not.be.empty;
          done();
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
      cleanup();
    });

    test("shows the file, current version and updated version", done => {
      const file = "file.json";
      try {
        updateFile(file, newVersion, {}, (err, result) => {
          output.should.have.string(file);
          output.should.have.string(newVersion);
          output.should.have.string(result.oldVersion);
          done();
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }
      cleanup();
    });
  });
});
