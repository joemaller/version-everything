// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semverRegex = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/gi;

const combineRegexp = require("./regexp-escape-combine");

/**
 * The set of semver-containing patterns which will be updated to the new version
 * the `<SEMVER>` token will be replaced with the current version string
 */
const patterns = [
  /^(\s*(?:\/\/|#|\*)*\s*Version:?\s*)(<SEMVER>)$/gim,
  /(v)(<SEMVER>)$/gim, // simple "v1.2.34" string at the end of a line
  /^(\s+\*\s+@version\s+)((?:[^:]+:)?\s+.*)$/gim, // phpdoc @version tag
  /^(\s*LABEL\s+(?:version|"version")=")(<SEMVER>)(")/gim,
];

module.exports = function (data, version) {
  const oldVersions = data.match(semverRegex);
  if (!oldVersions) {
    return;
  }

  const oldVersionsRegex = combineRegexp(oldVersions);

  const matches = patterns
    .map((pat) => {
      const regex = new RegExp(
        pat.source.replace(/<SEMVER>/g, oldVersionsRegex),
        pat.flags
      );
      return { pattern: regex, match: regex.exec(data) };
    })
    .filter((pat) => pat.match);

  if (matches.length) {
    let newData = data;

    matches.forEach((regex) => {
      const replace =
        regex.match.length == 3 ? `$${1}${version}` : `$${1}${version}$${3}`;
      newData = newData.replace(regex.pattern, replace);
    });

    return { data: newData, oldVersion: matches[0].match[2] };
  }
};
