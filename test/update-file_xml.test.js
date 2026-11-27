// @ts-check

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import fs from "fs-extra";

import tmpFixture from "./lib/tmp-fixture.js";
import updateFile from "../app/update-file.js";

let newVersion = "3.14.1592";
const cwd = process.cwd();
const fixtureDir = "./test/fixtures";

const consoleLog = console.log;

// ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
const cleanup = () => {
  console.log = consoleLog;
};

beforeEach(() => {
  const tmpFix = tmpFixture(fixtureDir);
  process.chdir(tmpFix);
});

afterEach(() => {
  process.chdir(cwd);
  cleanup();
});

describe("XML files", () => {
  test("should report the previous version (xml file)", async () => {
    const file = "file.xml";
    let output = "";
    console.log = (str) => (output += str); // mock console.log

    const result = await updateFile(file, newVersion, {});
    expect(result).toHaveProperty("oldVersion");
    expect(output).toMatch(result.oldVersion);
  });

  test("should increment the root-level version attribute in an xml file", async () => {
    const file = "file.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = await fs.readFile(file);

    expect(actual.toString()).toMatch(`<version>${newVersion}</version>`);
  });

  test("should add root-level version attribute in an xml files without versions", async () => {
    const file = "no-version.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = await fs.readFile(file);

    expect(actual.toString()).toMatch(`<version>${newVersion}</version>`);
    expect(result.oldVersion).toBeUndefined;
  });

  test("Should not add a second version element if one already exists", async () => {
    const file = "file.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    expect(result).toHaveProperty("oldVersion");
    expect(result.data).not.toMatch(result.oldVersion);
  });

  test("Should not add a top-level version element if CData contains a version", async () => {
    const file = "comments.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();

    expect(actual).not.toMatch(`<version>${result.oldVersion}</version>`);
    expect(actual).not.toMatch(`<version>${newVersion}</version>`);
  });

  test("Should keep empty CData", async () => {
    const file = "empty-cdata.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).not.toMatch(`<version>${result.oldVersion}</version>`);
    expect(actual).toMatch("<![CDATA[]]>");
  });

  test("Should check empty CData (whitespace is not empty)", async () => {
    const file = "empty-cdata-whitespace.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).not.toMatch(`<version>${result.oldVersion}</version>`);
    expect(actual).toMatch("<![CDATA[ ");
    expect(actual).toMatch(" ]]>");
  });

  test("should add a version to an empty Version element", async () => {
    const file = "empty-version.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}</version>`);
    expect(result.oldVersion).toBeUndefined();
  });

  test("should add a version to an empty Version element", async () => {
    const file = "empty-version-self-closing.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}</version>`);
    expect(result.oldVersion).toBeUndefined();
  });

  test("should update a version despite an extra element", async () => {
    const file = "version-with-extra-element.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}`);
    expect(actual).toMatch(/<extra\s*\/>/);
  });

  test("should update version despite a comment existing before root element", async () => {
    const file = "root-comment.xml";
    const result = await updateFile(file, newVersion, { quiet: true });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}`);
  });

  test("should add a custom top-level attribute in an xml file when missing", async () => {
    const file = "no-version.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["project-version"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`project-version="${newVersion}"`);
  });

  test("should set a custom top-level attribute value in an xml file when value is emtpy", async () => {
    const file = "top-level-attribute-empty.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["project-version"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`project-version="${newVersion}"`);
  });

  test("should increment a custom top-level attribute value in an xml file", async () => {
    const file = "top-level-attribute.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["project-version"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`project-version="${newVersion}"`);
  });

  test("should increment a custom top-level attribute value in an xml file when key starts with ~", async () => {
    const file = "top-level-attribute.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["~project-version"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`project-version="${newVersion}"`);
  });

  test("should increment a nested custom attribute in an xml file", async () => {
    const file = "nested-custom-attribute.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["gupdate/app/updatecheck~version"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(
      `<updatecheck codebase="https://domain.com/extension.crx" version="${newVersion}"`
    );
  });

  test("should set custom attribute value in an xml file when attribute has no value", async () => {
    const file = "nested-custom-attribute-no-value.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["gupdate/app/updatecheck~version"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(
      `<updatecheck codebase="https://domain.com/extension.crx" version="${newVersion}"`
    );
  });

  test("should add custom attribute in an xml file when element has no attributes", async () => {
    const file = "nested-custom-attribute-missing.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["gupdate/app/updatecheck~version"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<updatecheck version="${newVersion}"`);
  });

  test("should add version element when no matching keys found", async () => {
    const file = "nested-custom-attribute.xml";
    const result = await updateFile(file, newVersion, {
      quiet: true,
      xml: { keys: ["some/key~some-attribute"] },
    });
    const actual = (await fs.readFile(file)).toString();
    expect(actual).toMatch(`<version>${newVersion}`);
  });

  describe("fast-xml-parser", () => {
    /**
     * Write an XML string to a file in the temp fixture dir, update it
     * and return the result and the new file contents
     */
    const bump = async (xml, options = {}) => {
      const file = "inline-test.xml";
      await fs.writeFile(file, xml);
      const result = await updateFile(file, newVersion, {
        quiet: true,
        ...options,
      });
      const actual = (await fs.readFile(file)).toString();
      return { result, actual };
    };

    test("keeps a DOCTYPE declaration", async () => {
      const doctype = '<!DOCTYPE note SYSTEM "Note.dtd">';
      const { actual } = await bump(
        `<?xml version="1.0"?>\n${doctype}\n<note>\n  <version>1.0.0</version>\n</note>\n`
      );
      expect(actual).toMatch(`?>\n${doctype}\n<note>`);
      expect(actual).toMatch(`<version>${newVersion}</version>`);
    });

    test("keeps a DOCTYPE with an internal subset", async () => {
      const doctype = '<!DOCTYPE note [\n  <!ENTITY who "Tove">\n]>';
      const { actual } = await bump(
        `<?xml version="1.0"?>\n${doctype}\n<note><to>&who;</to></note>`
      );
      expect(actual).toMatch(doctype);
      expect(actual).toMatch("<to>&who;</to>");
    });

    test("keeps processing instructions", async () => {
      const pi = '<?xml-stylesheet type="text/xsl" href="style.xsl"?>';
      const { actual } = await bump(
        `<?xml version="1.0"?>\n${pi}\n<root><version>1.0.0</version></root>`
      );
      expect(actual).toMatch(`<?xml version="1.0"?>\n${pi}\n<root>`);
    });

    test("does not decode or re-encode entities", async () => {
      const { actual } = await bump(
        `<root>\n  <version>1.0.0</version>\n  <t>a &amp; b &lt; c</t>\n  <q attr="x &quot;y&quot;"/>\n</root>`
      );
      expect(actual).toMatch("<t>a &amp; b &lt; c</t>");
      expect(actual).toMatch('<q attr="x &quot;y&quot;"/>');
    });

    test("keeps values as strings", async () => {
      const { actual } = await bump(
        `<root><version>1.0</version><n>007</n><b>true</b></root>`
      );
      expect(actual).toMatch("<n>007</n>");
      expect(actual).toMatch("<b>true</b>");
    });

    test("keeps the trailing newline", async () => {
      const withNewline = await bump(`<root><version>1.0.0</version></root>\n`);
      expect(withNewline.actual).toMatch(/<\/root>\n$/);

      const without = await bump(`<root><version>1.0.0</version></root>`);
      expect(without.actual).toMatch(/<\/root>$/);
    });

    test("adds a version to an empty root element", async () => {
      const { actual } = await bump(`<?xml version="1.0"?>\n<root/>`);
      expect(actual).toMatch(`<root>\n  <version>${newVersion}</version>\n</root>`);
    });

    test("puts CDATA among elements on its own line", async () => {
      const { actual } = await bump(
        `<root><![CDATA[ Version: 1.0.0 ]]><item/></root>`
      );
      expect(actual).toMatch(
        `<root>\n  <![CDATA[ Version: ${newVersion} ]]>\n  <item/>\n</root>`
      );
    });

    test("throws on invalid XML", async () => {
      const bumpXML = (await import("../app/lib/bump-xml.js")).default;
      const config = { xml: {}, prefixes: [] };
      expect(() => bumpXML("<root><open></root>", newVersion, config)).toThrow(
        /Invalid XML/
      );
      expect(() => bumpXML('{"version": "1.0.0"}', newVersion, config)).toThrow(
        /Invalid XML/
      );
    });

    test("indents with a number of spaces", async () => {
      const { actual } = await bump(`<root><version>1.0.0</version></root>`, {
        xml: { spaces: 4 },
      });
      expect(actual).toMatch(`<root>\n    <version>`);
    });

    test("indents with a string", async () => {
      const { actual } = await bump(`<root><version>1.0.0</version></root>`, {
        xml: { spaces: "\t" },
      });
      expect(actual).toMatch(`<root>\n\t<version>`);
    });

    test("passes builder options to fast-xml-parser", async () => {
      const { actual } = await bump(
        `<root>\n  <version>1.0.0</version>\n  <empty/>\n</root>`,
        { xml: { builder: { suppressEmptyNode: false } } }
      );
      expect(actual).toMatch("<empty></empty>");
    });

    test("warns about unsupported (xml-js) options", async () => {
      let output = "";
      console.log = (str) => (output += str);
      await bump(`<root><version>1.0.0</version></root>`, {
        quiet: false,
        xml: { compact: false, indentCdata: true },
      });
      expect(output).toMatch("compact, indentCdata");
    });

    test("reports the old version of a nested key", async () => {
      const file = "nested-custom-attribute.xml";
      const result = await updateFile(file, newVersion, {
        quiet: true,
        xml: { keys: ["gupdate/app/updatecheck~version"] },
      });
      expect(result.oldVersion).toEqual("44.33.22");
    });

    test("doesn't add a version element when an earlier key matched", async () => {
      const { actual } = await bump(
        `<root a="1.0.0">\n  <child b="1.0.0"/>\n</root>`,
        { xml: { keys: ["root/child~b", "no/match~here"] } }
      );
      expect(actual).toMatch(`<child b="${newVersion}"/>`);
      expect(actual).not.toMatch("<version>");
    });

    test("doesn't set a key attribute on a parent when the path is incomplete", async () => {
      const { actual } = await bump(`<root>\n  <app/>\n</root>`, {
        xml: { keys: ["root/app/updatecheck~version"] },
      });
      expect(actual).not.toMatch(`<app version=`);
      expect(actual).toMatch(`<version>${newVersion}</version>`);
    });
  });
});
