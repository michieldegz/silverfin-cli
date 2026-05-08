/**
 * Reconciliation text fixtures.
 *
 * Each named export represents a distinct scenario. "API response" objects
 * mirror what sfApi returns to callers. "Disk config" objects mirror what
 * gets written to config.json on disk.
 *
 * Factory:
 *   makeReconciliation(overrides)  — merge overrides into REC_BASE
 *   makeDiskConfig(overrides)      — merge overrides into DISK_CONFIG_BASE
 */

// ─── API response objects (shape returned by sfApi) ───────────────────────────

/** Minimal valid reconciliation — happy-path baseline. */
const REC_BASE = {
  id: 12345,
  handle: "example_handle",
  text: "Main liquid content",
  text_parts: [{ name: "part_1", content: "Part 1: updated content" }],
  tests: "test_1:\n  context: {}\n  expectation:\n    reconciled: false",
  name_en: "Example Handle",
  name_nl: "",
  name_fr: "",
  name_de: "",
  name_da: "",
  name_se: "",
  name_fi: "",
  description_en: "",
  description_nl: "",
  description_fr: "",
  reconciliation_type: "reconciliation",
  externally_managed: false,
  published: true,
  hide_code: false,
  is_active: true,
  auto_hide_formula: "",
  virtual_account_number: "",
  public: false,
  use_full_width: false,
  downloadable_as_docx: false,
  test_firm_id: null,
};

/** Externally managed — used for stats percentage and lock-down tests. */
const REC_EXTERNALLY_MANAGED = {
  ...REC_BASE,
  id: 11111,
  handle: "ext_managed_rec",
  externally_managed: true,
  hide_code: true,
};

/** Multiple text parts — tests part merging and file creation. */
const REC_WITH_TEXT_PARTS = {
  ...REC_BASE,
  id: 22222,
  handle: "rec_with_parts",
  text_parts: [
    { name: "part_1", content: "Part 1: calculation logic" },
    { name: "part_2", content: "Part 2: validation" },
    { name: "", content: "" }, // empty part — should be ignored
  ],
};

/** All locale fields populated — tests locale preservation on re-import. */
const REC_MULTI_LOCALE = {
  ...REC_BASE,
  id: 33333,
  handle: "multi_locale_rec",
  name_en: "Custom English Name",
  name_nl: "Aangepaste Nederlandse Naam",
  name_fr: "Nom Français Personnalisé",
  name_de: "Benutzerdefinierter Deutscher Name",
  name_da: "Tilpasset Dansk Navn",
  name_se: "Anpassat Svenskt Namn",
  name_fi: "Mukautettu Suomenkielinen Nimi",
};

/** Reconciliation returned for partner context (no direct firm id). */
const REC_PARTNER = {
  ...REC_BASE,
  id: 44444,
  handle: "partner_rec",
  externally_managed: true,
  reconciliation_type: "only_reconciled_with_data",
};

/** Reconciliation with downloadable_as_docx set — only valid for externally managed. */
const REC_DOWNLOADABLE_DOCX = {
  ...REC_BASE,
  id: 55555,
  handle: "docx_rec",
  externally_managed: true,
  downloadable_as_docx: true,
};

// ─── Minimal API inputs for ReconciliationText unit tests ────────────────────
// These are deliberately sparse — ReconciliationText.save() fills in defaults
// from its own logic. Using a full object would produce different disk output.

/** Minimal API response used as input to ReconciliationText.save() unit tests. */
const REC_SAVE_INPUT = {
  handle: "example_handle",
  id: 808080,
  text: "Main liquid content",
  text_parts: [
    { name: "part_1", content: "Part 1: updated content" },
    { name: "", content: "" },
  ],
  tests: "Test content as string",
  externally_managed: true,
};

// ─── Disk config objects (shape of config.json on disk) ───────────────────────

/** Baseline disk config produced by a single firm-100 import. */
const DISK_CONFIG_BASE = {
  id: { 100: 12345 },
  partner_id: {},
  handle: "example_handle",
  text: "main.liquid",
  text_parts: { part_1: "text_parts/part_1.liquid" },
  test: "tests/example_handle_liquid_test.yml",
  name_en: "Example Handle",
  name_nl: "example_handle",
  name_fr: "",
  name_de: "",
  name_da: "",
  name_se: "",
  name_fi: "",
  description_en: "",
  description_nl: "",
  description_fr: "",
  reconciliation_type: "reconciliation",
  externally_managed: false,
  auto_hide_formula: "",
  downloadable_as_docx: false,
  hide_code: false,
  is_active: true,
  public: false,
  published: true,
  use_full_width: false,
  virtual_account_number: "",
  test_firm_id: null,
};

/** Config already on disk from a previous import by firm 200 — merge scenario. */
const DISK_CONFIG_EXISTING = {
  id: { 200: 50505 },
  partner_id: {},
  handle: "example_handle",
  text: "main.liquid",
  text_parts: {
    old_part: "text_parts/old_part.liquid",
    part_1: "text_parts/part_1.liquid",
  },
  name_en: "Example Handle",
  name_nl: "example_handle",
  name_fr: "",
  name_de: "",
  name_da: "",
  name_se: "",
  name_fi: "",
  description_en: "",
  description_nl: "",
  description_fr: "",
  reconciliation_type: "reconciliation",
  externally_managed: false,
  auto_hide_formula: "",
  downloadable_as_docx: false,
  hide_code: false,
  is_active: true,
  public: false,
  published: true,
  use_full_width: false,
  virtual_account_number: "",
  test_firm_id: null,
};

/** Disk config for a partner import. */
const DISK_CONFIG_PARTNER = {
  id: {},
  partner_id: { p1: 44444 },
  handle: "partner_rec",
  text: "main.liquid",
  text_parts: {},
  name_en: "",
  name_nl: "partner_rec",
  reconciliation_type: "only_reconciled_with_data",
  externally_managed: true,
};

/**
 * Config already on disk for firm 200 before a second save for firm 100.
 * Used in the merge-scenario unit test in reconciliationTexts.test.js.
 */
const DISK_CONFIG_PRE_MERGE = {
  id: { 200: 505050 },
  handle: "old_handle",
  text: "main.liquid",
  text_parts: {
    old_part: "text_parts/old_part.liquid",
    part_1: "text_parts/part_1.liquid",
  },
  externally_managed: false,
  auto_hide_formula: "",
  downloadable_as_docx: false,
  hide_code: true,
  is_active: true,
  name_nl: "example_handle",
  name_fr: "",
  name_en: "",
  name_de: "",
  name_da: "",
  name_se: "",
  name_fi: "",
  public: false,
  published: true,
  reconciliation_type: "only_reconciled_with_data",
  use_full_width: true,
  virtual_account_number: "",
  test_firm_id: null,
};

/** Config written to disk — used as the starting state for read() unit tests. */
const DISK_CONFIG_FOR_READ = {
  id: { 100: 808080 },
  handle: "example_handle",
  name_en: "Example Handle",
  name_nl: "Voorbeeld Handle",
  name_fr: "Exemple",
  name_de: "Beispiel Handle",
  name_da: "Eksempel Handle",
  name_se: "Exempel Handle",
  name_fi: "Esimerkki Handle",
  reconciliation_type: "can_be_reconciled_without_data",
  text: "main.liquid",
  text_parts: { part_1: "text_parts/part_1.liquid" },
  externally_managed: true,
};

/** Config ready for publishReconciliationByHandle — includes text + text_parts paths. */
const DISK_CONFIG_FOR_PUBLISH = {
  id: { 1001: 555 },
  partner_id: {},
  handle: "pub_rec",
  text: "main.liquid",
  text_parts: {},
  name_en: "Pub Rec",
  reconciliation_type: "reconciliation",
  externally_managed: false,
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeReconciliation(overrides = {}) {
  return { ...REC_BASE, ...overrides };
}

function makeDiskConfig(overrides = {}) {
  return { ...DISK_CONFIG_BASE, ...overrides };
}

module.exports = {
  // Full API response objects
  REC_BASE,
  REC_EXTERNALLY_MANAGED,
  REC_WITH_TEXT_PARTS,
  REC_MULTI_LOCALE,
  REC_PARTNER,
  REC_DOWNLOADABLE_DOCX,
  // Minimal unit-test inputs
  REC_SAVE_INPUT,
  // Disk config objects
  DISK_CONFIG_BASE,
  DISK_CONFIG_EXISTING,
  DISK_CONFIG_PARTNER,
  DISK_CONFIG_FOR_PUBLISH,
  DISK_CONFIG_PRE_MERGE,
  DISK_CONFIG_FOR_READ,
  // Factories
  makeReconciliation,
  makeDiskConfig,
};
