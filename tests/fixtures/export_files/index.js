/**
 * Export file fixtures.
 *
 * "API response" objects mirror what sfApi returns.
 * "Disk config" objects mirror config.json on disk.
 */

// ─── API response objects ─────────────────────────────────────────────────────

/** Minimal valid export file — happy-path baseline. */
const EXPORT_FILE_MINIMAL = {
  id: 808080,
  name_nl: "example_name_nl",
  name_en: "example_name_en",
  name_fr: "example_name_fr",
  text: "Main liquid content",
  text_parts: [{ name: "part_1", content: "Part 1: updated content" }],
  file_name: "export_file.sxbrl",
  externally_managed: false,
  hide_code: false,
  published: true,
  download_warning: "",
  encoding: "UTF-8",
  description_en: "",
  description_nl: "",
  description_fr: "",
};

/** Externally managed export file. */
const EXPORT_FILE_EXTERNALLY_MANAGED = {
  ...EXPORT_FILE_MINIMAL,
  id: 11111,
  name_nl: "ext_managed_export",
  name_en: "ext_managed_export",
  name_fr: "ext_managed_export",
  externally_managed: true,
  hide_code: true,
  file_name: "ext_managed.sxbrl",
};

/** Export file with multiple text parts. */
const EXPORT_FILE_WITH_TEXT_PARTS = {
  ...EXPORT_FILE_MINIMAL,
  id: 22222,
  name_nl: "multi_part_export",
  name_en: "multi_part_export",
  name_fr: "multi_part_export",
  text_parts: [
    { name: "part_a", content: "Part A content" },
    { name: "part_b", content: "Part B content" },
  ],
  file_name: "multi_part.sxbrl",
};

// ─── Minimal API inputs for ExportFile unit tests ────────────────────────────

/** Minimal API response used as input to ExportFile.save() unit tests. */
const EXPORT_FILE_SAVE_INPUT = {
  name_nl: "example_name_nl",
  id: 808080,
  text: "Main liquid content",
  text_parts: [{ name: "part_1", content: "Part 1: updated content" }],
  externally_managed: true,
  file_name: "export_file.sxbrl",
  name_en: "example_name_nl",
  name_fr: "example_name_nl",
};

// ─── Disk config objects ──────────────────────────────────────────────────────

/** Baseline disk config after a firm-100 import. */
const CONFIG_AFTER_IMPORT = {
  id: { 100: 808080 },
  partner_id: {},
  externally_managed: false,
  name_en: "example_name_en",
  name_nl: "example_name_nl",
  name_fr: "example_name_fr",
  description_en: "",
  description_nl: "",
  description_fr: "",
  file_name: "export_file.sxbrl",
  hide_code: false,
  published: true,
  download_warning: "",
  text: "main.liquid",
  encoding: "UTF-8",
  text_parts: { part_1: "text_parts/part_1.liquid" },
};

/** Config already on disk for firm 200 — merge scenario. */
const CONFIG_BEFORE_MERGE = {
  id: { 200: 505050 },
  partner_id: {},
  externally_managed: false,
  name_nl: "example_name_nl",
  name_fr: "old_name_fr",
  name_en: "old_name_en",
  description_en: "",
  description_nl: "",
  description_fr: "",
  file_name: "old_file_name.sxbrl",
  text: "main.liquid",
  hide_code: true,
  published: true,
  download_warning: "",
  encoding: "UTF-8",
  text_parts: {
    old_part: "text_parts/old_part.liquid",
    part_1: "text_parts/part_1.liquid",
  },
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeExportFile(overrides = {}) {
  return { ...EXPORT_FILE_MINIMAL, ...overrides };
}

function makeConfig(overrides = {}) {
  return { ...CONFIG_AFTER_IMPORT, ...overrides };
}

module.exports = {
  EXPORT_FILE_MINIMAL,
  EXPORT_FILE_EXTERNALLY_MANAGED,
  EXPORT_FILE_WITH_TEXT_PARTS,
  EXPORT_FILE_SAVE_INPUT,
  CONFIG_AFTER_IMPORT,
  CONFIG_BEFORE_MERGE,
  makeExportFile,
  makeConfig,
};
