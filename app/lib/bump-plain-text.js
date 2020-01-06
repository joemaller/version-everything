// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const semverRegex = /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/gi;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = function(data, version) {
  const oldVersions = data.match(semverRegex);
  if (!oldVersions) {
    return;
  }

  const oldVersionsRegex = oldVersions
    .filter(Boolean)
    .map(escapeRegExp)
    .join("|");

  const patterns = [
    /^(\s*(?:\/\/|#|\*)*\s*Version:?\s*)(<SEMVER>)$/gim,
    /(v)(<SEMVER>)$/gim, // simple "v1.2.34" string at the end of a line
    /^(\s+\*\s+@version\s+)((?:[^:]+:)?\s+.*)$/gim, // phpdoc @version tag
    /^(\s*LABEL\s+(?:version|"version")=")(<SEMVER>)(")/gim
  ].map(
    pat =>
      new RegExp(pat.source.replace(/<SEMVER>/g, oldVersionsRegex), pat.flags)
  );

  const matches = patterns
    .map(regex => ({ pattern: regex, match: regex.exec(data) }))
    .filter(pat => pat.match);

  if (matches.length) {
    let newData = data;

    matches.forEach(regex => {
      const replace =
        regex.match.length == 3 ? `$${1}${version}` : `$${1}${version}$${3}`;
      newData = newData.replace(regex.pattern, replace);
    });

    return {
      data: newData,
      oldVersion: matches[0].match[2]
    };
  }
};
