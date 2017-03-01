// const sed = require('shelljs').sed;

module.exports = function(data, version) {

  const regex = /^(\s*(?:\/\/|#|\*)*\s*Version:?\s*)(.*)$/im;
  // console.log(regex);
  // console.log(data);

  // console.log(data.replace(regex, '$1' + version));
  const matches = data.match(regex);
  return {
    data: data.replace(regex, '$1' + version),
    oldVersion: matches[2]
  };

  // const newData = {
  //   data
  // }
  // sed('-i', /^([# ]*Version: *)(.*)/, `$1${ pkg.version }`, f);

};