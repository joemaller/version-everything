// @ts-check

import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

import bumpPlainText from "./bump-plain-text.js";
import logInit from "./log-init.js";

/**
 * Property names used by fast-xml-parser's ordered ("preserveOrder") format.
 * Each node is an object with one name key holding an array of child nodes,
 * plus an optional ":@" key holding the node's attributes.
 */
const TEXT = "#text";
const CDATA = "#cdata";
const COMMENT = "#comment";
const ATTRS = ":@";

/**
 * Options bump-xml depends on. These are applied last and can't be overridden.
 */
const requiredOptions = {
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: TEXT,
  cdataPropName: CDATA,
  commentPropName: COMMENT,
  processEntities: false,
};

const parserDefaults = {
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
};

const builderDefaults = {
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
  suppressBooleanAttributes: false,
};

/**
 * Supported keys in the `xml` config object. Anything else is most likely a
 * leftover xml-js option from version-everything 0.x
 */
const supportedOptions = ["keys", "spaces", "parser", "builder"];

/**
 * fast-xml-parser does not keep <!DOCTYPE> declarations, so they're held
 * aside and put back after the document is rebuilt.
 */
const doctypeRegex = /<!DOCTYPE(?:[^[>]|\[[\s\S]*?\])*>/i;

/**
 * Placeholder comments stand in for content the builder would otherwise drop
 * or format differently. They're swapped back after the document is built.
 */
const placeholderPrefix = "version-everything-placeholder-";

/** @param {object} node */
const nodeName = (node) => Object.keys(node).find((k) => k !== ATTRS);

/** @param {object} node */
const isElement = (node) => !/^[#?]/.test(nodeName(node) ?? "#");

/**
 * Remove whitespace-only text nodes so the builder can re-indent the
 * document. Content inside xml:space="preserve" elements is left alone.
 * @param {object[]} nodes
 * @returns {object[]}
 */
const stripWhitespace = (nodes) =>
  nodes
    .filter((node) => !(TEXT in node) || String(node[TEXT]).trim() !== "")
    .map((node) => {
      const name = nodeName(node);
      if (
        isElement(node) &&
        Array.isArray(node[name]) &&
        node[ATTRS]?.["xml:space"] !== "preserve"
      ) {
        node[name] = stripWhitespace(node[name]);
      }
      return node;
    });

/**
 * fast-xml-parser's builder writes CDATA inline, like text. When a CDATA
 * section sits among elements (not mixed with text), swap it for a
 * placeholder comment so it gets its own indented line like other children.
 * @param {object[]} nodes
 * @param {string[]} held CDATA sections held aside, by placeholder index
 * @returns {object[]}
 */
const holdCdata = (nodes, held) => {
  const hasText = nodes.some((node) => TEXT in node);
  return nodes.map((node) => {
    const name = nodeName(node);
    if (CDATA in node && !hasText) {
      const text = node[CDATA].find((n) => TEXT in n)?.[TEXT] ?? "";
      held.push(`<![CDATA[${text}]]>`);
      return placeholder(held.length - 1);
    }
    if (isElement(node) && Array.isArray(node[name])) {
      node[name] = holdCdata(node[name], held);
    }
    return node;
  });
};

/** @param {number|string} id */
const placeholder = (id) => ({
  [COMMENT]: [{ [TEXT]: placeholderPrefix + id }],
});

/**
 * Translate the user's `xml` config into fast-xml-parser options
 * @param {object} xmlConfig
 */
const getOptions = (xmlConfig = {}) => {
  const indent = {};
  if (typeof xmlConfig.spaces === "number") {
    indent.indentBy = " ".repeat(xmlConfig.spaces);
  } else if (typeof xmlConfig.spaces === "string") {
    indent.indentBy = xmlConfig.spaces;
  }

  return {
    parser: { ...parserDefaults, ...xmlConfig.parser, ...requiredOptions },
    builder: {
      ...builderDefaults,
      ...indent,
      ...xmlConfig.builder,
      ...requiredOptions,
    },
  };
};

export default (data, version, config) => {
  let oldVersion;
  let hasCdata = false;
  let hasVersion = false;
  let hasKeyUpdates = false;
  let prefixData = {};

  const xmlConfig = config.xml || {};

  const unsupported = Object.keys(xmlConfig).filter(
    (key) => !supportedOptions.includes(key),
  );
  if (unsupported.length) {
    logInit(config.quiet)(
      `⚠️ Ignoring unsupported xml option(s): ${unsupported.join(", ")}. ` +
        `See "Migrating XML options" in the version-everything README.`,
    );
  }

  if (config.prefixes.length > 0) {
    prefixData = bumpPlainText(data, version, config);
    hasVersion = !!prefixData?.data;
  }

  const source = prefixData?.data || data;

  const valid = XMLValidator.validate(source);
  if (valid !== true) {
    throw new Error(
      `Invalid XML: ${valid.err.msg} (line ${valid.err.line}, col ${valid.err.col})`,
    );
  }

  const options = getOptions(xmlConfig);
  const xmlData = stripWhitespace(new XMLParser(options.parser).parse(source));

  const rootIndex = xmlData.findIndex(isElement);
  if (rootIndex === -1) {
    throw new Error("Invalid XML: No root element found.");
  }
  const rootElement = xmlData[rootIndex];
  const rootName = nodeName(rootElement);
  const rootChildren = rootElement[rootName];

  const doctype = source.match(doctypeRegex)?.[0];

  for (const child of rootChildren) {
    /**
     * Note: CData and Version elements could have different existing values
     *       Whichever appears last will be the returned value. After one pass,
     *       dual-versioned (CData & Element) values will be in sync.
     *
     *       This will be processed twice if there's a prefix as the whole file
     *       would have already been processed as plain text
     */
    if (CDATA in child) {
      const textNode = child[CDATA].find((n) => TEXT in n);
      const cdata = textNode && bumpPlainText(textNode[TEXT], version, config);

      if (cdata && cdata.data) {
        hasCdata = true;
        oldVersion = cdata.oldVersion;
        textNode[TEXT] = cdata.data;
      }
    }

    if (nodeName(child) === "version") {
      hasVersion = true;
      const textNodes = child.version.filter((n) => TEXT in n);
      if (textNodes.length) {
        textNodes.forEach((n) => {
          oldVersion = String(n[TEXT]).trim();
          n[TEXT] = version;
        });
      } else {
        child.version.unshift({ [TEXT]: version });
      }
    }
  }

  /**
   * Set an attribute on a node, creating the attributes object if needed.
   * Returns the attribute's previous value.
   */
  const setAttribute = (node, attribute) => {
    node[ATTRS] = node[ATTRS] || {};
    const previous = node[ATTRS][attribute];
    node[ATTRS][attribute] = version;
    return previous;
  };

  /**
   * Walk the tree following element names in `hierarchy`, setting
   * `attribute` on every matching element at the final level.
   */
  const traverseElements = (nodes, hierarchy, attribute, level) => {
    let updated = false;
    for (const node of nodes) {
      if (!isElement(node) || nodeName(node) !== hierarchy[level]) {
        continue;
      }
      if (level < hierarchy.length - 1) {
        updated =
          traverseElements(
            node[hierarchy[level]],
            hierarchy,
            attribute,
            level + 1,
          ) || updated;
      } else {
        const previous = setAttribute(node, attribute);
        if (previous) {
          oldVersion = previous;
        }
        updated = true;
      }
    }
    return updated;
  };

  (xmlConfig.keys || []).forEach((key) => {
    const pieces = key.split("~").filter((piece) => piece);
    if (pieces.length === 1) {
      hasKeyUpdates = true;
      const previous = setAttribute(rootElement, pieces[0]);
      if (previous) {
        oldVersion = previous;
      }
    } else {
      const hierarchy = pieces[0].split("/");
      const attribute = pieces[1];
      if (traverseElements(xmlData, hierarchy, attribute, 0)) {
        hasKeyUpdates = true;
      }
    }
  });

  if (!hasCdata && !hasVersion && !hasKeyUpdates) {
    rootChildren.unshift({ version: [{ [TEXT]: version }] });
  }

  const held = [];
  const output = holdCdata(xmlData, held);
  if (doctype) {
    output.splice(output.findIndex(isElement), 0, placeholder("doctype"));
  }

  let newXml = new XMLBuilder(options.builder).build(output).trim();

  newXml = newXml.replace(
    new RegExp(`<!--${placeholderPrefix}(\\d+|doctype)-->`, "g"),
    (match, id) => (id === "doctype" ? doctype : held[Number(id)]),
  );

  // Keep the source file's trailing newline
  if (/\n$/.test(data)) {
    newXml += "\n";
  }

  return { oldVersion, data: newXml };
};
