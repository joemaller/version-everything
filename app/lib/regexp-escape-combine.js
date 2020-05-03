const escapeStringRegexp = require("escape-string-regexp");

/**
 * Regexp-escapes strings then combines them into a single pattern
 * This project uses it exclusively for semver strings, but ti will handle
 * any string value.
 * @param {String|String[]} input A string or array of strings
 */
module.exports = (input) => {
  const patterns = typeof input === "string" ? [input] : input;
  const combined = [...new Set(patterns)]
    .filter(Boolean)
    .map((i) => {
      if (typeof i !== "string") {
        throw new Error("patterns must be strings");
      }
      return i;
    })
    .map((pat) => {
      return escapeStringRegexp(pat);
    })
    .join("|");
  return combined.length ? `(?:${combined})` : combined;
};
