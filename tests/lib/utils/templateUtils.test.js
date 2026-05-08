jest.mock("consola");

const { consola } = require("consola");
const {
  TEMPLATES_NAME_ATTRIBUTE,
  TEMPLATE_TYPE_NAMES,
  TEMPLATE_MAP_TYPES,
  getTemplateName,
  checkValidName,
  filterParts,
  missingLiquidCode,
  missingNameNL,
} = require("../../../lib/utils/templateUtils");

describe("templateUtils", () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── Constants ────────────────────────────────────────────────────────────────

  describe("TEMPLATES_NAME_ATTRIBUTE", () => {
    it("maps reconciliationText to handle", () => expect(TEMPLATES_NAME_ATTRIBUTE.reconciliationText).toBe("handle"));
    it("maps accountTemplate to name_nl", () => expect(TEMPLATES_NAME_ATTRIBUTE.accountTemplate).toBe("name_nl"));
    it("maps exportFile to name_nl", () => expect(TEMPLATES_NAME_ATTRIBUTE.exportFile).toBe("name_nl"));
    it("maps sharedPart to name", () => expect(TEMPLATES_NAME_ATTRIBUTE.sharedPart).toBe("name"));
  });

  describe("TEMPLATE_MAP_TYPES", () => {
    it("maps legacy 'reconciliation' to reconciliationText", () => expect(TEMPLATE_MAP_TYPES.reconciliation).toBe("reconciliationText"));
    it("maps legacy 'reconciliation_text' to reconciliationText", () => expect(TEMPLATE_MAP_TYPES.reconciliation_text).toBe("reconciliationText"));
    it("maps legacy 'account_detail_template' to accountTemplate", () => expect(TEMPLATE_MAP_TYPES.account_detail_template).toBe("accountTemplate"));
    it("maps 'account_template' to accountTemplate", () => expect(TEMPLATE_MAP_TYPES.account_template).toBe("accountTemplate"));
    it("maps 'shared_part' to sharedPart", () => expect(TEMPLATE_MAP_TYPES.shared_part).toBe("sharedPart"));
    it("maps 'export_file' to exportFile", () => expect(TEMPLATE_MAP_TYPES.export_file).toBe("exportFile"));
  });

  describe("TEMPLATE_TYPE_NAMES", () => {
    it("has a human-readable name for each template type", () => {
      expect(TEMPLATE_TYPE_NAMES.reconciliationText).toBeDefined();
      expect(TEMPLATE_TYPE_NAMES.sharedPart).toBeDefined();
      expect(TEMPLATE_TYPE_NAMES.exportFile).toBeDefined();
      expect(TEMPLATE_TYPE_NAMES.accountTemplate).toBeDefined();
    });
  });

  // ─── getTemplateName ──────────────────────────────────────────────────────────

  describe("getTemplateName", () => {
    it("returns handle for reconciliationText", () => {
      expect(getTemplateName({ handle: "my_rec" }, "reconciliationText")).toBe("my_rec");
    });

    it("returns name_nl for accountTemplate", () => {
      expect(getTemplateName({ name_nl: "My Account Template" }, "accountTemplate")).toBe("My Account Template");
    });

    it("returns name_nl for exportFile", () => {
      expect(getTemplateName({ name_nl: "My Export" }, "exportFile")).toBe("My Export");
    });

    it("returns name for sharedPart", () => {
      expect(getTemplateName({ name: "my_shared_part" }, "sharedPart")).toBe("my_shared_part");
    });
  });

  // ─── checkValidName ───────────────────────────────────────────────────────────

  describe("checkValidName", () => {
    test.each([
      ["reconciliationText", "valid_handle_123", true],
      ["reconciliationText", "UPPER_CASE", true],
      ["reconciliationText", "invalid handle", false],
      ["reconciliationText", "has-dash", false],
      ["reconciliationText", "has/slash", false],
      ["reconciliationText", "has.dot", false],
      ["accountTemplate", "Valid Name With Spaces", true],
      ["accountTemplate", "has/forward/slash", false],
      ["accountTemplate", "has\\backslash", false],
      ["exportFile", "Export File Name", true],
      ["exportFile", "has/slash", false],
      ["exportFile", "has\\backslash", false],
      ["sharedPart", "valid_shared_part_1", true],
      ["sharedPart", "invalid name!", false],
    ])("checkValidName(%s, %s) → %s", (templateType, name, expected) => {
      const result = checkValidName(name, templateType);
      expect(result).toBe(expected);
      if (!expected) {
        expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining(`"${name}"`));
      } else {
        expect(consola.warn).not.toHaveBeenCalled();
      }
    });
  });

  // ─── filterParts ─────────────────────────────────────────────────────────────

  describe("filterParts", () => {
    it("reduces text_parts array to a {name: content} object", () => {
      const template = {
        text_parts: [
          { name: "part_a", content: "liquid code a" },
          { name: "part_b", content: "liquid code b" },
        ],
      };
      expect(filterParts(template)).toEqual({
        part_a: "liquid code a",
        part_b: "liquid code b",
      });
    });

    it("returns an empty object for an empty text_parts array", () => {
      expect(filterParts({ text_parts: [] })).toEqual({});
    });
  });

  // ─── missingLiquidCode ────────────────────────────────────────────────────────

  describe("missingLiquidCode", () => {
    it("returns true and logs a warning when template.text is undefined", () => {
      const result = missingLiquidCode({ handle: "my_rec" });
      expect(result).toBe(true);
      expect(consola.warn).toHaveBeenCalled();
    });

    it("returns true and logs a warning when template.text is null", () => {
      expect(missingLiquidCode({ text: null })).toBe(true);
    });

    it("returns true and logs a warning when template.text is empty string", () => {
      expect(missingLiquidCode({ text: "" })).toBe(true);
    });

    it("returns false when template.text is present", () => {
      const result = missingLiquidCode({ text: "{% liquid code %}" });
      expect(result).toBe(false);
      expect(consola.warn).not.toHaveBeenCalled();
    });

    it("includes the handle in the warning message when available", () => {
      missingLiquidCode({ handle: "problematic_handle" });
      expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("problematic_handle"));
    });
  });

  // ─── missingNameNL ────────────────────────────────────────────────────────────

  describe("missingNameNL", () => {
    it("returns true and logs a warning when name_nl is missing", () => {
      const result = missingNameNL({ name_en: "My Template" });
      expect(result).toBe(true);
      expect(consola.warn).toHaveBeenCalled();
    });

    it("returns true when name_nl is an empty string", () => {
      expect(missingNameNL({ name_nl: "" })).toBe(true);
    });

    it("returns false when name_nl is present", () => {
      const result = missingNameNL({ name_nl: "Mijn Sjabloon" });
      expect(result).toBe(false);
      expect(consola.warn).not.toHaveBeenCalled();
    });

    it("includes fallback name (name_en) in the warning message", () => {
      missingNameNL({ name_en: "English Name" });
      expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("English Name"));
    });

    it("falls back to name_fr in the warning when name_en is also missing", () => {
      missingNameNL({ name_fr: "Nom Français" });
      expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Nom Français"));
    });
  });
});
