// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import versionEverything from "../index.js";
import getConfig from "../app/get-config.js";

const args = "getConfig args";
vi.mock("../index.js");
vi.mock("../app/get-config.js", () => ({
  default: vi.fn().mockImplementation(() => args),
}));

describe("CLI tests", () => {
  test("Call VersionEverything", async () => {
    await import("../cli.js");
    expect(versionEverything).toHaveBeenCalledOnce();
    expect(versionEverything).toHaveBeenCalledWith(args);

    expect(getConfig).toHaveBeenCalledOnce();
    expect(getConfig).toHaveBeenCalledWith(expect.any(Object));
  });
});
