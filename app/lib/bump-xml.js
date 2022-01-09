// @ts-check

const convert = require("xml-js");
const bumpPlainText = require("./bump-plain-text");

module.exports = (data, version, config) => {
  let oldVersion;
  let hasCdata = false;
  let hasVersion = false;
  let prefixData = {};

  try {
    if (config.prefixes.length > 0) {
      prefixData = bumpPlainText(data, version, config);
      hasVersion = !!prefixData?.data;
    }

    const xmlData = convert.xml2js(prefixData?.data || data, config.xml);

    for (let n = 0; n < xmlData.elements[0].elements.length; n++) {
      /**
       * Note: CData and Version elements could have different existing values
       *       Whichever appears last will be the returned value. After one pass,
       *       dual-versioned (CData & Element) values will be in sync.
       *
       *       This will be processed twice if there's a prefix as the whole file
       *       would have already been processed as plain text
       */
      if (xmlData.elements[0].elements[n].type === "cdata") {
        const cdata = bumpPlainText(
          xmlData.elements[0].elements[n].cdata,
          version,
          config
        );

        if (cdata && cdata.data) {
          hasCdata = true;
          oldVersion = cdata.oldVersion;
          xmlData.elements[0].elements[n].cdata = cdata.data;
        }
      }

      if (xmlData.elements[0].elements[n].name === "version") {
        hasVersion = true;
        if (xmlData.elements[0].elements[n].elements) {
          const len = xmlData.elements[0].elements[n].elements.length;
          for (let m = 0; m < len; m++) {
            if (xmlData.elements[0].elements[n].elements[m].type === "text") {
              oldVersion = xmlData.elements[0].elements[n].elements[m].text;
              xmlData.elements[0].elements[n].elements[m].text = version;
            }
          }
        } else {
          xmlData.elements[0].elements[n].elements = [
            { type: "text", text: version },
          ];
        }
      }
    }

    if (!hasCdata && !hasVersion) {
      const versionElement = {
        type: "element",
        name: "version",
        elements: [{ type: "text", text: version }],
      };
      xmlData.elements[0].elements.unshift(versionElement);
    }

    const newXml = convert.js2xml(xmlData, config.xml);

    return { oldVersion, data: newXml };
  } catch (err) {
    throw err;
  }
};
