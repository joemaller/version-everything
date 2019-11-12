"use strict";

module.exports = function(data, version) {
  const patterns = [
    /^(\s*(?:\/\/|#|\*)*\s*Version:?\s*)(\d.*)$/gim, // generic "version: 1.2.34" string
    /(v)(\d\S*)$/gim, // simple "v1.2.34" string at the end of a line
    /^(\s+\*\s+@version\s+)((?:[^:]+:)?\s+.*)$/gim // phpdoc @version tag
  ];
  const matches = patterns
    .map(regex => ({ pattern: regex, match: regex.exec(data) }))
    .filter(pat => pat.match)[0];

    console.log(matches);
  // only return if matches finds something
  if (matches)
    return {
      data: data.replace(matches.pattern, "$1" + version),
      oldVersion: matches.match[2]
    };
};
