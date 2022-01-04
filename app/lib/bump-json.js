// @ts-check

module.exports = function (data, version, config) {
  try {
    let json = JSON.parse(data, config.json.reviver);
    const oldVersion = json.version;
    json.version = version;
    return {
      oldVersion: oldVersion,
      data: JSON.stringify(json, config.json.replacer, config.json.space),
    };
  } catch (err) {
    // console.log('bumpJSON Error:', err);
    throw err;
  }
};
