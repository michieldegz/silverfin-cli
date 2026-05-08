/**
 * Account template fixtures.
 *
 * "API response" objects mirror what sfApi returns.
 * "Disk config" objects mirror config.json on disk.
 */

// ─── API response objects ─────────────────────────────────────────────────────

/** Minimal valid account template — happy-path baseline. */
const ACCOUNT_TEMPLATE_MINIMAL = {
  id: 808080,
  name_nl: "name_nl",
  name_en: "",
  name_fr: "",
  text: "Main liquid content",
  text_parts: [{ name: "part_1", content: "Part 1: updated content" }],
  tests: "# Add your Liquid Tests here",
  externally_managed: false,
  hide_code: false,
  published: true,
  account_range: null,
  mapping_list_ranges: [],
  description_en: "",
  description_nl: "",
  description_fr: "",
  test_firm_id: null,
};

/** Externally managed account template. */
const ACCOUNT_TEMPLATE_EXTERNALLY_MANAGED = {
  ...ACCOUNT_TEMPLATE_MINIMAL,
  id: 11111,
  name_nl: "ext_managed_account",
  externally_managed: true,
  hide_code: true,
};

/** Template with mapping_list_ranges for both firm and partner contexts. */
const ACCOUNT_TEMPLATE_WITH_MAPPING_LIST_RANGES = {
  ...ACCOUNT_TEMPLATE_MINIMAL,
  id: 33333,
  name_nl: "mapped_account",
  mapping_list_ranges: [
    { type: "firm", env_id: "100", range: "1-10" },
    { type: "partner", env_id: "200", range: "11-20" },
  ],
};

/** All locale fields populated — tests locale preservation on re-import. */
const ACCOUNT_TEMPLATE_MULTI_LOCALE = {
  ...ACCOUNT_TEMPLATE_MINIMAL,
  id: 44444,
  name_nl: "multi_locale_account",
  name_en: "test_account_template",
  name_fr: "test_account_template",
};

// ─── Minimal API inputs for AccountTemplate unit tests ───────────────────────

/** Minimal API response used as input to AccountTemplate.save() unit tests. */
const ACCOUNT_TEMPLATE_SAVE_INPUT = {
  name_nl: "name_nl",
  name_en: "",
  name_fr: "",
  id: 808080,
  text: "Main liquid content",
  text_parts: [
    { name: "part_1", content: "Part 1: updated content" },
    { name: "", content: "" },
  ],
  tests: "# Add your Liquid Tests here",
  externally_managed: true,
  hide_code: true,
  mapping_list_ranges: [],
};

// ─── Disk config objects ──────────────────────────────────────────────────────

/** Baseline disk config after a firm-100 import. */
const CONFIG_AFTER_IMPORT = {
  id: { 100: 808080 },
  partner_id: {},
  externally_managed: false,
  name_en: "",
  name_nl: "name_nl",
  name_fr: "",
  description_en: "",
  description_nl: "",
  description_fr: "",
  text: "main.liquid",
  test: "tests/name_nl_liquid_test.yml",
  text_parts: { part_1: "text_parts/part_1.liquid" },
  account_range: null,
  mapping_list_ranges: [],
  hide_code: false,
  published: true,
  test_firm_id: null,
};

/** Config already on disk for firm 200 — merge scenario. */
const CONFIG_PRIOR_IMPORT = {
  id: { 200: 505050 },
  name_nl: "old_name_nl",
  text: "main.liquid",
  text_parts: {
    old_part: "text_parts/old_part.liquid",
    part_1: "text_parts/part_1.liquid",
  },
  name_fr: "",
  name_en: "",
  account_range: null,
  mapping_list_ranges: [],
  hide_code: false,
  published: true,
  test_firm_id: null,
};

/** Existing config on disk before a second save (merge scenario unit test). */
const CONFIG_BEFORE_MERGE = {
  id: { 200: 505050 },
  name_nl: "old_name_nl",
  text: "main.liquid",
  text_parts: {
    old_part: "text_parts/old_part.liquid",
    part_1: "text_parts/part_1.liquid",
  },
  name_fr: "",
  name_en: "",
  account_range: null,
  mapping_list_ranges: [],
  hide_code: false,
  published: true,
  test_firm_id: null,
};

/** Config written to disk — starting state for AccountTemplate.read() unit tests. */
const CONFIG_FOR_READ = {
  id: { 100: 808080 },
  name_en: "test_account_template",
  name_nl: "test_account_template",
  name_fr: "test_account_template",
  text: "main.liquid",
  text_parts: { part_1: "text_parts/part_1.liquid" },
  externally_managed: true,
  account_range: null,
  mapping_list_ranges: [],
  hide_code: true,
  published: true,
};

/** Config with all locale fields — tests locale preservation on read. */
const CONFIG_MULTI_LOCALE = {
  ...CONFIG_AFTER_IMPORT,
  id: { 100: 44444 },
  name_nl: "multi_locale_account",
  name_en: "test_account_template",
  name_fr: "test_account_template",
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeAccountTemplate(overrides = {}) {
  return { ...ACCOUNT_TEMPLATE_MINIMAL, ...overrides };
}

function makeConfig(overrides = {}) {
  return { ...CONFIG_AFTER_IMPORT, ...overrides };
}

module.exports = {
  // Full API response objects
  ACCOUNT_TEMPLATE_MINIMAL,
  ACCOUNT_TEMPLATE_EXTERNALLY_MANAGED,
  ACCOUNT_TEMPLATE_WITH_MAPPING_LIST_RANGES,
  ACCOUNT_TEMPLATE_MULTI_LOCALE,
  // Minimal unit-test inputs
  ACCOUNT_TEMPLATE_SAVE_INPUT,
  // Disk config objects
  CONFIG_AFTER_IMPORT,
  CONFIG_PRIOR_IMPORT,
  CONFIG_MULTI_LOCALE,
  CONFIG_BEFORE_MERGE,
  CONFIG_FOR_READ,
  // Factories
  makeAccountTemplate,
  makeConfig,
};
