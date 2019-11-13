module.exports = function(data, version) {
  const patterns = [
    /^(\s*(?:\/\/|#|\*)*\s*Version:?\s*)(\d.*)$/gim, // generic "version: 1.2.34" string
    /(v)(\d.*)$/gim, // simple "v1.2.34" string at the end of a line
    /^(\s+\*\s+@version\s+)((?:[^:]+:)?\s+.*)$/gim // phpdoc @version tag
  ];

  const matches = patterns
    .map(regex => ({ pattern: regex, match: regex.exec(data) }))
    .filter(pat => pat.match);

  if (matches.length) {
    let newData = data;
    matches.forEach(regex => {
      newData = newData.replace(regex.pattern, `$1${version}`);
    });

    return {
      data: newData,
      oldVersion: matches[0].match[2]
    };
  }
};
