// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import versionEverything from "../index.js";
import parseArgs from "../app/parse-args.js";

const args = "parseArgs args";
vi.mock("../index.js");
vi.mock("../app/parse-args.js", () => ({
  default: vi.fn().mockImplementation(() => args),
}));

describe("CLI tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Call VersionEverything", async () => {
    await import("../cli.js");
    expect(versionEverything).toHaveBeenCalledOnce();
    expect(versionEverything).toHaveBeenCalledWith(args);

    expect(parseArgs).toHaveBeenCalledOnce();
    expect(parseArgs).toHaveBeenCalledWith(expect.any(Object));
  });
});
