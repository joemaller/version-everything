const readPkgUp = require("read-pkg-up");

const tmpFixture = require("./lib/tmp-fixture");
const versionEverything = require("../");

const cwd = process.cwd();
const fixtureDir = "./test/fixture/";

const getVersionFiles = require("../app/get-version-files");
const updateFile = require("../app/update-file");

jest.mock("../app/get-version-files");
jest.mock("../app/update-file");

getVersionFiles.mockImplementation(args => ["file"]);
updateFile.mockImplementation((f, v, o) => {});

describe("Index file tests", () => {
  beforeEach(() => {
    process.chdir(tmpFixture(fixtureDir));
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  test("Manually specify version string", () => {
    process.chdir("./package");
    const version = readPkgUp.sync({ normalize: false }).packageJson.version;
    versionEverything();
    expect(getVersionFiles).toHaveBeenCalled();
    expect(updateFile).toHaveBeenCalledWith("file", version, {});
  });

  test("Manually specify version string", () => {
    process.chdir("./package");
    const version = "1.2.3";
    versionEverything({ version });
    expect(getVersionFiles).toHaveBeenCalled();
    expect(updateFile).toHaveBeenCalledWith("file", version, {});
  });

  test("Get version-everything.options", () => {
    process.chdir("./package");
    const version = readPkgUp.sync({ normalize: false }).packageJson.version;
    const options = { quiet: true };
    versionEverything({ "version-everything": { options } });
    expect(getVersionFiles).toHaveBeenCalled();
    expect(updateFile).toHaveBeenCalledWith("file", version, options);
  });
});
