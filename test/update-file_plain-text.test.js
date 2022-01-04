// @ts-check
const fs = require("fs-extra");

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
      "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " + newVersion.replace(/\./g, "\\."),
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
      "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " + newVersion.replace(/\./g, "\\."),
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
      expect(result).toHaveProperty("oldVersion", expect.any(String));
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
      "^\\s*(?:\\/\\/|#|\\*)*\\s*Version: " + newVersion.replace(/\./g, "\\."),
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
