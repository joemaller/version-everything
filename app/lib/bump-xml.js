// @ts-check

const convert = require("xml-js");
const bumpPlainText = require("./bump-plain-text");

module.exports = (data, version, config) => {
  // 1. Update any existing root-level CData or version elements
  // 2. If nothing was updated, add a new root-level version element.
  try {
    const xmlData = convert.xml2js(data, {});
    let oldVersion;
    let hasCdata = false;
    let hasVersion = false;

    for (let n = 0; n < xmlData.elements[0].elements.length; n++) {
      /**
       * Note: CData and Version elements could have different existing values
       *       Whichever appears last will be the returned value. After one pass,
       *       dual-versioned (CData & Element) values will be in sync.
       */
      if (xmlData.elements[0].elements[n].type === "cdata") {
        const cdata = bumpPlainText(
          xmlData.elements[0].elements[n].cdata,
          version,
          config
        );
        if (cdata.data) {
          hasCdata = true;
          oldVersion = cdata.oldVersion;
          xmlData.elements[0].elements[n].cdata = cdata.data;
        }
      }

      if (xmlData.elements[0].elements[n].name === "version") {
        hasVersion = true;
        const len = xmlData.elements[0].elements[n].elements.length;
        for (let m = 0; m < len; m++) {
          if (xmlData.elements[0].elements[n].elements[m].type === "text") {
            oldVersion = xmlData.elements[0].elements[n].elements[m].text;
            xmlData.elements[0].elements[n].elements[m].text = version;
          }
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

    const newXml = convert.js2xml(xmlData, {
      compact: false,
      spaces: 2,
      indentCdata: true,
    });

    return { oldVersion, data: newXml };
  } catch (err) {
    throw err;
  }
};
