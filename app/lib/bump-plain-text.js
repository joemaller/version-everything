'use strict';

module.exports = function(data, version) {
  const regex = /^(\s*(?:\/\/|#|\*)*\s*Version:?\s*)(\d.*)$/gim;
  const matches = data.match(regex);
  // only return if matches finds something
  if (matches) return {
    data: data.replace(regex, '$1' + version),
    oldVersion: matches[2]
  };
};
