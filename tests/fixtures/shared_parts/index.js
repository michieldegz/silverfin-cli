/**
 * Shared part fixtures.
 *
 * Each named export represents a distinct scenario. "API response" objects
 * mirror what sfApi returns. "Disk config" objects mirror config.json on disk.
 */

// ─── API response objects ─────────────────────────────────────────────────────

/** Minimal valid shared part — happy-path baseline. */
const SHARED_PART_MINIMAL = {
  id: 808080,
  name: "example_shared_part_name",
  text: "Shared part liquid content",
  used_in: [],
  externally_managed: false,
};

/** Externally managed — used for stats and lock-down scenarios. */
const SHARED_PART_EXTERNALLY_MANAGED = {
  ...SHARED_PART_MINIMAL,
  id: 11111,
  name: "ext_managed_shared",
  externally_managed: true,
};

/** Shared part stored under a partner environment. */
const SHARED_PART_PARTNER = {
  ...SHARED_PART_MINIMAL,
  id: 99999,
  name: "partner_shared",
  externally_managed: false,
};

/** Shared part that references a reconciliation via used_in. */
const SHARED_PART_WITH_USED_IN = {
  ...SHARED_PART_MINIMAL,
  id: 80808,
  name: "shared_used",
  used_in: [{ id: { 100: 5 }, type: "reconciliationText" }],
};

// ─── Disk config objects ──────────────────────────────────────────────────────

/** Baseline disk config after a firm-100 import. */
const CONFIG_AFTER_IMPORT = {
  id: { 100: 808080 },
  partner_id: {},
  name: "example_shared_part_name",
  text: "example_shared_part_name.liquid",
  used_in: [],
  externally_managed: false,
};

/** Config after a partner import — id is empty, partner_id is set. */
const CONFIG_PARTNER = {
  id: {},
  partner_id: { partner_1: 99999 },
  name: "partner_shared",
  text: "partner_shared.liquid",
  used_in: [],
  externally_managed: false,
};

/** Config already on disk for firm 100 — merge scenario (firm 200 is added). */
const CONFIG_BEFORE_MERGE = {
  id: { 100: 111 },
  partner_id: {},
  name: "shared_merge",
  text: "shared_merge.liquid",
  used_in: [],
  externally_managed: false,
};

/** Config with a legacy used_in entry (numeric id) — should be filtered out on save. */
const CONFIG_LEGACY_USED_IN = {
  id: { 100: 808 },
  partner_id: {},
  name: "shared_legacy",
  text: "shared_legacy.liquid",
  used_in: [{ id: 123, handle: "old_rec", type: "reconciliationText" }],
  externally_managed: false,
};

/** Blank config ready for updateTemplateId. */
const CONFIG_FOR_UPDATE_ID = {
  id: {},
  partner_id: {},
  name: "shared_update_id",
  text: "shared_update_id.liquid",
  used_in: [],
  externally_managed: false,
};

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeSharedPart(overrides = {}) {
  return { ...SHARED_PART_MINIMAL, ...overrides };
}

function makeConfig(overrides = {}) {
  return { ...CONFIG_AFTER_IMPORT, ...overrides };
}

module.exports = {
  SHARED_PART_MINIMAL,
  SHARED_PART_EXTERNALLY_MANAGED,
  SHARED_PART_PARTNER,
  SHARED_PART_WITH_USED_IN,
  CONFIG_AFTER_IMPORT,
  CONFIG_PARTNER,
  CONFIG_BEFORE_MERGE,
  CONFIG_LEGACY_USED_IN,
  CONFIG_FOR_UPDATE_ID,
  makeSharedPart,
  makeConfig,
};
