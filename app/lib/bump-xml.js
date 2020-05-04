const xml2js = require("xml2js");
const parser = new xml2js.Parser({ preserveChildrenOrder: true});
const builder = new xml2js.Builder({cdata: true});

module.exports = async (data, version, config) => {
  try {
    const xmlData = await parser.parseStringPromise(data);
    const oldVersion = xmlData.version;
    // xmlData.version = version;

    console.log(xmlData);
    return { oldVersion, data: builder.buildObject(xmlData) };
  } catch (err) {
    throw err;
  }
};
