/**
 * E2E tests for bin/cli.js.
 *
 * Two strategies are used:
 *   1. spawnSync — for argument-validation paths that exit early (no API calls needed)
 *   2. Direct toolkit invocation with jest.mock on sfApi — for full import/publish flows
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// ─── Argument-validation tests (spawnSync) ────────────────────────────────────

const CLI = path.resolve(__dirname, "../../bin/cli.js");

function cli(...args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    encoding: "utf8",
    timeout: 10000,
    env: {
      ...process.env,
      // Prevent real credential lookups from slowing tests
      SF_API_CLIENT_ID: "test_id",
      SF_API_SECRET: "test_secret",
    },
  });
}

describe("CLI argument validation (spawnSync)", () => {
  it("--version exits 0 and prints the package version", () => {
    const pkg = require("../../package.json");
    const result = cli("--version");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(pkg.version);
  });

  it("--help exits 0 and lists main commands", () => {
    const result = cli("--help");
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/import-reconciliation/);
    expect(result.stdout).toMatch(/update-reconciliation/);
  });

  it("import-reconciliation with no options exits 1", () => {
    const result = cli("import-reconciliation", "--firm", "1001", "--yes");
    expect(result.status).toBe(1);
  });

  it("import-reconciliation --handle and --all together exits 1", () => {
    const result = cli("import-reconciliation", "--firm", "1001", "--handle", "rec", "--all", "--yes");
    expect(result.status).toBe(1);
  });

  it("update-reconciliation --partner without --message exits 1", () => {
    const result = cli("update-reconciliation", "--partner", "p1", "--handle", "rec", "--yes");
    expect(result.status).toBe(1);
  });
});

// ─── Full command tests (jest.mock + direct toolkit invocation) ───────────────

jest.mock("consola");
jest.mock("../../lib/api/sfApi");

const { consola } = require("consola");
const SF = require("../../lib/api/sfApi");
const toolkit = require("../../index");

describe("toolkit integration (mocked sfApi)", () => {
  let tempDir;
  const repoRoot = path.resolve(__dirname, "../..");

  beforeEach(() => {
    jest.clearAllMocks();
    tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
    process.chdir(tempDir);
    jest.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(repoRoot);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  describe("fetchReconciliationById", () => {
    const mockRec = {
      id: 12345,
      handle: "my_rec",
      text: "line1\nline2",
      text_parts: [],
      tests: null,
      name_en: "My Rec",
      reconciliation_type: "reconciliation",
      externally_managed: false,
      published: true,
    };

    it("writes files to disk on success", async () => {
      SF.readReconciliationTextById.mockResolvedValue({ data: mockRec });
      await toolkit.fetchReconciliationById("firm", 1001, 12345);
      expect(fs.existsSync(path.join(tempDir, "reconciliation_texts", "my_rec", "main.liquid"))).toBe(true);
      expect(consola.success).toHaveBeenCalledWith(expect.stringContaining("my_rec"));
    });

    it("calls process.exit(1) when template is not found", async () => {
      SF.readReconciliationTextById.mockResolvedValue({ data: null });
      await toolkit.fetchReconciliationById("firm", 1001, 99999);
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("wasn't found"));
    });

    it("calls process.exit(1) on API error", async () => {
      SF.readReconciliationTextById.mockRejectedValue(new Error("network error"));
      await toolkit.fetchReconciliationById("firm", 1001, 12345);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe("fetchSharedPartById", () => {
    const mockSharedPart = {
      id: 808,
      name: "my_shared_part",
      text: "shared liquid",
      used_in: [],
      externally_managed: false,
    };

    it("writes shared part files to disk on success", async () => {
      SF.readSharedPartById.mockResolvedValue({ data: mockSharedPart });
      await toolkit.fetchSharedPartById("firm", 1001, 808);
      expect(fs.existsSync(path.join(tempDir, "shared_parts", "my_shared_part", "my_shared_part.liquid"))).toBe(true);
    });

    it("calls process.exit(1) when shared part is not found", async () => {
      SF.readSharedPartById.mockResolvedValue({ data: null });
      await toolkit.fetchSharedPartById("firm", 1001, 9999);
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe("publishReconciliationByHandle", () => {
    it("calls SF.updateReconciliationText with correct params", async () => {
      // Create the required files
      const recDir = path.join(tempDir, "reconciliation_texts", "pub_rec");
      fs.mkdirSync(recDir, { recursive: true });
      fs.writeFileSync(path.join(recDir, "main.liquid"), "liquid code");
      fs.writeFileSync(
        path.join(recDir, "config.json"),
        JSON.stringify({ id: { 1001: 555 }, partner_id: {}, handle: "pub_rec", name_en: "Pub Rec", reconciliation_type: "reconciliation", externally_managed: false, text: "main.liquid", text_parts: {} })
      );

      SF.readReconciliationTextById.mockResolvedValue({ data: { id: 555, handle: "pub_rec", text_parts: [], reconciliation_type: "reconciliation" } });
      SF.updateReconciliationText.mockResolvedValue({ data: { id: 555 } });

      await toolkit.publishReconciliationByHandle("firm", 1001, "pub_rec", "test message");
      // version_comment is embedded in the template object, not a separate argument
      expect(SF.updateReconciliationText).toHaveBeenCalledWith(
        "firm", 1001, 555,
        expect.objectContaining({ handle: "pub_rec", version_comment: "test message" })
      );
    });
  });
});
