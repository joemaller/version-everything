// @ts-check

const convert = require("xml-js");
const bumpPlainText = require("./bump-plain-text");

module.exports = (data, version, config) => {
  let oldVersion;
  let hasCdata = false;
  let hasVersion = false;
  let hasKeyUpdates = false;
  let prefixData = {};

  try {
    if (config.prefixes.length > 0) {
      prefixData = bumpPlainText(data, version, config);
      hasVersion = !!prefixData?.data;
    }

    const xmlData = convert.xml2js(prefixData?.data || data, config.xml);

    let elementNumber = 0;
    let rootElement = xmlData.elements[elementNumber];
    while (
      rootElement.type !== "element" &&
      elementNumber < xmlData.elements.length - 1
    ) {
      rootElement = xmlData.elements[++elementNumber];
    }

    for (let n = 0; n < rootElement.elements.length; n++) {
      /**
       * Note: CData and Version elements could have different existing values
       *       Whichever appears last will be the returned value. After one pass,
       *       dual-versioned (CData & Element) values will be in sync.
       *
       *       This will be processed twice if there's a prefix as the whole file
       *       would have already been processed as plain text
       */
      if (rootElement.elements[n].type === "cdata") {
        const cdata = bumpPlainText(
          rootElement.elements[n].cdata,
          version,
          config
        );

        if (cdata && cdata.data) {
          hasCdata = true;
          oldVersion = cdata.oldVersion;
          rootElement.elements[n].cdata = cdata.data;
        }
      }

      if (rootElement.elements[n].name === "version") {
        hasVersion = true;
        if (rootElement.elements[n].elements) {
          const len = rootElement.elements[n].elements.length;
          for (let m = 0; m < len; m++) {
            if (rootElement.elements[n].elements[m].type === "text") {
              oldVersion = rootElement.elements[n].elements[m].text;
              rootElement.elements[n].elements[m].text = version;
            }
          }
        } else {
          rootElement.elements[n].elements = [{ type: "text", text: version }];
        }
      }
    }

    if (config.xml && config.xml.keys) {
      for (let k = 0; k < config.xml.keys.length; k++) {
        const pieces = config.xml.keys[k].split("~").filter((piece) => piece);
        if (pieces.length === 1) {
          hasKeyUpdates = true;
          if (!rootElement.attributes) {
            rootElement.attributes = {};
          }

          oldVersion = rootElement.attributes[pieces[0]];
          rootElement.attributes[pieces[0]] = version;
        } else {
          const hierarchy = pieces[0].split("/");
          const attribute = pieces[1];

          traverseElemens(
            xmlData.elements,
            hierarchy,
            attribute,
            0,
            oldVersion,
            version,
            hasKeyUpdates
          );
        }
      }
    }

    if (!hasCdata && !hasVersion && !hasKeyUpdates) {
      const versionElement = {
        type: "element",
        name: "version",
        elements: [{ type: "text", text: version }],
      };
      rootElement.elements.unshift(versionElement);
    }

    const newXml = convert.js2xml(xmlData, config.xml);

    return { oldVersion, data: newXml };
  } catch (err) {
    throw err;
  }

  function traverseElemens(
    elements,
    hierarchy,
    attribute,
    level,
    oldVersion,
    newVersion,
    keyUpdated
  ) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].name === hierarchy[level]) {
        if (level < hierarchy.length - 1 && elements[i].elements) {
          traverseElemens(
            elements[i].elements,
            hierarchy,
            attribute,
            level + 1,
            oldVersion,
            newVersion,
            keyUpdated
          );
        } else {
          keyUpdated = true;
          if (!elements[i].attributes) {
            elements[i].attributes = {};
          }

          oldVersion = elements[i].attributes[attribute];
          elements[i].attributes[attribute] = newVersion;
        }
      }
    }
  }
};
