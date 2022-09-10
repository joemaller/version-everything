import {jest} from '@jest/globals';
jest.useFakeTimers();

import combineRegexp from "../app/lib/regexp-escape-combine.js";

describe("Combine Strings", () => {
  test("Escape an array containing one string", () => {
    const input = ["3.1.4"];
    const expected = "(?:3\\.1\\.4)";
    expect(combineRegexp(input)).toBe(expected);
  });

  test("Escape  a bare string", () => {
    const input = "3.1.4";
    const expected = "(?:3\\.1\\.4)";
    expect(combineRegexp(input)).toBe(expected);
  });

  test("Deal with empty strings", () => {
    const input = "";
    const expected = "";
    expect(combineRegexp(input)).toBe(expected);
  });

  test("Deal with empty array", () => {
    const input = [];
    const expected = "";
    expect(combineRegexp(input)).toBe(expected);
  });

  test("Deal with array containing empty strings", () => {
    const input = [""];
    const expected = "";
    expect(combineRegexp(input)).toBe(expected);
  });

  test("Deal with mixed array of strings and empty strings", () => {
    const input = ["and.1", "", "{?."];
    const expected = "(?:and\\.1|\\{\\?\\.)";
    expect(combineRegexp(input)).toBe(expected);
  });

  test("Deal with array containing other stuff", () => {
    const input = [true, false, { a: 12 }, [1, 2, 3], [{ a: "dog" }]];
    const expected = "";
    expect(() => combineRegexp(input)).toThrow();
  });

  test("Escape and combine an array of many strings", () => {
    const input = ["1.2.3", "4.5.6"];
    const expected = "(?:1\\.2\\.3|4\\.5\\.6)";
    expect(combineRegexp(input)).toBe(expected);
  });

  test("Remove duplicate strings before escaping", () => {
    const input = ["1.2.3", "1.2.3", "4.5.6", "1.2.3"];
    const expected = "(?:1\\.2\\.3|4\\.5\\.6)";
    expect(combineRegexp(input)).toBe(expected);
  });
});
