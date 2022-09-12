import { jest } from "@jest/globals";
jest.useFakeTimers();

jest.unstable_mockModule("../index.js", () => ({
  default: jest.fn(),
}));

let versionEverything, cli;

describe("CLI tests", () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.resetAllMocks();
    versionEverything = (await import("../index.js")).default;
  });

  test("Call VersionEverything", async () => {
    cli = (await import("../cli.js")).default;
    expect(versionEverything).toHaveBeenCalledTimes(1);
  });
});
