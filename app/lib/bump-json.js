'use strict';

module.exports = function(data, version, config) {
  try {
    let json = JSON.parse(data, config.reviver);
    const oldVersion = json.version;
    json.version = version;
    return {
      oldVersion: oldVersion,
      data: JSON.stringify(json, config.replacer, config.space)
    };
  } catch (err) {
    // console.log('bumpJSON Error:', err);
    throw err;
  }
};
