"use strict";

module.exports = function(data, version) {
  const patterns = [
    /^(\s*(?:\/\/|#|\*)*\s*Version:?\s*)(\d.*)$/gim, // generic "version: 1.2.34" string
    /^(\s+\*\s+@version\s+)((?:[^:]+:)?\s+.*)$/gim // phpdoc @version tag
  ];
  const matches = patterns
    .map(regex => ({ pattern: regex, match: regex.exec(data) }))
    .filter(pat => pat.match)[0];

  // only return if matches finds something
  if (matches)
    return {
      data: data.replace(matches.pattern, "$1" + version),
      oldVersion: matches.match[2]
    };
};
