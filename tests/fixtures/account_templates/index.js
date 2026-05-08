/**
 * Account template fixtures.
 *
 * "API response" objects mirror what sfApi returns.
 * "Disk config" objects mirror config.json on disk.
 */

// ─── API response objects ─────────────────────────────────────────────────────

/** Minimal valid account template — happy-path baseline. */
const AT_BASE = {
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
const AT_EXTERNALLY_MANAGED = {
  ...AT_BASE,
  id: 11111,
  name_nl: "ext_managed_account",
  externally_managed: true,
  hide_code: true,
};

/** Template with mapping_list_ranges for both firm and partner contexts. */
const AT_WITH_MAPPING_LIST_RANGES = {
  ...AT_BASE,
  id: 33333,
  name_nl: "mapped_account",
  mapping_list_ranges: [
    { type: "firm", env_id: "100", range: "1-10" },
    { type: "partner", env_id: "200", range: "11-20" },
  ],
};

/** All locale fields populated — tests locale preservation on re-import. */
const AT_MULTI_LOCALE = {
  ...AT_BASE,
  id: 44444,
  name_nl: "multi_locale_account",
  name_en: "test_account_template",
  name_fr: "test_account_template",
};

// ─── Disk config objects ──────────────────────────────────────────────────────

/** Baseline disk config after a firm-100 import. */
const DISK_CONFIG_BASE = {
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
const DISK_CONFIG_EXISTING = {
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

/** Config with all locale fields — tests locale preservation on read. */
const DISK_CONFIG_MULTI_LOCALE = {
  ...DISK_CONFIG_BASE,
  id: { 100: 44444 },
  name_nl: "multi_locale_account",
  name_en: "test_account_template",
  name_fr: "test_account_template",
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeAccountTemplate(overrides = {}) {
  return { ...AT_BASE, ...overrides };
}

function makeDiskConfig(overrides = {}) {
  return { ...DISK_CONFIG_BASE, ...overrides };
}

module.exports = {
  AT_BASE,
  AT_EXTERNALLY_MANAGED,
  AT_WITH_MAPPING_LIST_RANGES,
  AT_MULTI_LOCALE,
  DISK_CONFIG_BASE,
  DISK_CONFIG_EXISTING,
  DISK_CONFIG_MULTI_LOCALE,
  makeAccountTemplate,
  makeDiskConfig,
};
