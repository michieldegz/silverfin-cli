jest.mock("consola");
jest.mock("chalk", () => ({
  bold: (s) => s,
  italic: (s) => s,
  green: (s) => s,
  red: (s) => s,
  blue: { bold: (s) => s },
}));
jest.mock("child_process", () => ({ execSync: jest.fn() }));
jest.mock("../../../lib/utils/fsUtils");

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const fsUtils = require("../../../lib/utils/fsUtils");
const { generateOverview } = require("../../../lib/cli/stats");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const YAML_TWO_TESTS = `test_one:
  context: {}
  expectation:
    reconciled: false
test_two:
  context: {}
  expectation:
    reconciled: true`;

const YAML_ONE_TEST = `test_one:
  context: {}
  expectation:
    reconciled: false`;

describe("stats", () => {
  let tempDir;
  const repoRoot = path.resolve(__dirname, "../../..");

  beforeEach(() => {
    jest.clearAllMocks();
    tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
    process.chdir(tempDir);

    // Default fsUtils mocks
    fsUtils.FOLDERS = {
      reconciliationText: "reconciliation_texts",
      sharedPart: "shared_parts",
      exportFile: "export_files",
      accountTemplate: "account_templates",
    };
    fsUtils.getAllTemplatesOfAType.mockReturnValue([]);
    fsUtils.listExistingFiles.mockReturnValue([]);
    fsUtils.readConfig.mockReturnValue({ externally_managed: false });
    // No git activity by default
    execSync.mockReturnValue(Buffer.from(""));
  });

  afterEach(() => {
    process.chdir(repoRoot);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // ─── saveOverviewToFile (via generateOverview) ────────────────────────────────

  describe("saveOverviewToFile", () => {
    it("creates ./stats/ directory if it does not exist", async () => {
      await generateOverview("2024-01-01");
      expect(fs.existsSync(path.join(tempDir, "stats"))).toBe(true);
    });

    it("creates overview.csv with column headers on first run", async () => {
      await generateOverview("2024-01-01");
      const csvPath = path.join(tempDir, "stats", "overview.csv");
      expect(fs.existsSync(csvPath)).toBe(true);
      const content = fs.readFileSync(csvPath, "utf-8");
      expect(content).toContain("Period - Start");
      expect(content).toContain("Period - End");
    });

    it("appends a new data row on each call", async () => {
      await generateOverview("2024-01-01");
      await generateOverview("2024-02-01");
      const csvPath = path.join(tempDir, "stats", "overview.csv");
      const content = fs.readFileSync(csvPath, "utf-8");
      expect(content).toContain("2024-01-01");
      expect(content).toContain("2024-02-01");
    });

    it("row contains semicolon-separated values", async () => {
      await generateOverview("2024-01-01");
      const csvPath = path.join(tempDir, "stats", "overview.csv");
      const content = fs.readFileSync(csvPath, "utf-8");
      const dataLines = content.split("\r\n").filter((l) => l.trim() && !l.includes("Period - Start"));
      expect(dataLines.length).toBeGreaterThan(0);
      const columns = dataLines[0].split(";");
      expect(columns.length).toBe(32);
    });
  });

  // ─── percentageRoundTwo (via createRow output) ────────────────────────────────

  describe("percentageRoundTwo (exercised via CSV output)", () => {
    it("produces 0% when denominator is 0 (no templates)", async () => {
      fsUtils.getAllTemplatesOfAType.mockReturnValue([]);
      await generateOverview("2024-01-01");
      const content = fs.readFileSync(path.join(tempDir, "stats", "overview.csv"), "utf-8");
      const dataRow = content.split("\r\n")[1] || "";
      const columns = dataRow.split(";");
      // Column 20 is "All - externally managed (%)" — should be 0 when no templates
      expect(Number(columns[20])).toBe(0);
    });

    it("produces 100% when all templates are externally managed", async () => {
      const templateDir = path.join(tempDir, "reconciliation_texts", "rec_1");
      fs.mkdirSync(templateDir, { recursive: true });
      fs.writeFileSync(path.join(templateDir, "main.liquid"), "line1\nline2\n");

      fsUtils.getAllTemplatesOfAType.mockImplementation((type) => (type === "reconciliationText" ? ["rec_1"] : []));
      fsUtils.readConfig.mockReturnValue({ externally_managed: true });
      fsUtils.listExistingFiles.mockReturnValue([]);

      await generateOverview("2024-01-01");
      const content = fs.readFileSync(path.join(tempDir, "stats", "overview.csv"), "utf-8");
      const dataRow = content.split("\r\n")[1] || "";
      const columns = dataRow.split(";");
      // Column 21 is "Reconciliations - externally managed (%)"
      expect(Number(columns[21])).toBe(100);
    });
  });

  // ─── listNonEmptyTemplates (via getTemplatesSummary) ──────────────────────────

  describe("listNonEmptyTemplates", () => {
    it("counts only templates with more than 1 line in main.liquid", async () => {
      const templateDir1 = path.join(tempDir, "reconciliation_texts", "rec_multi");
      fs.mkdirSync(templateDir1, { recursive: true });
      fs.writeFileSync(path.join(templateDir1, "main.liquid"), "line1\nline2\n");

      const templateDir2 = path.join(tempDir, "reconciliation_texts", "rec_empty");
      fs.mkdirSync(templateDir2, { recursive: true });
      fs.writeFileSync(path.join(templateDir2, "main.liquid"), "single line");

      fsUtils.getAllTemplatesOfAType.mockImplementation((type) => (type === "reconciliationText" ? ["rec_multi", "rec_empty"] : []));
      fsUtils.listExistingFiles.mockReturnValue([]);
      fsUtils.readConfig.mockReturnValue({ externally_managed: false });

      await generateOverview("2024-01-01");
      const content = fs.readFileSync(path.join(tempDir, "stats", "overview.csv"), "utf-8");
      const dataRow = content.split("\r\n")[1] || "";
      const columns = dataRow.split(";");
      // Column 8 is "Reconciliations - templates" (total non-empty)
      expect(Number(columns[8])).toBe(1);
    });

    it("falls back to handle-named liquid file when main.liquid is absent", async () => {
      const templateDir = path.join(tempDir, "shared_parts", "my_shared");
      fs.mkdirSync(templateDir, { recursive: true });
      fs.writeFileSync(path.join(templateDir, "my_shared.liquid"), "line1\nline2\n");

      fsUtils.getAllTemplatesOfAType.mockImplementation((type) => (type === "sharedPart" ? ["my_shared"] : []));
      fsUtils.listExistingFiles.mockReturnValue([]);
      fsUtils.readConfig.mockReturnValue({ externally_managed: false });

      await generateOverview("2024-01-01");
      const content = fs.readFileSync(path.join(tempDir, "stats", "overview.csv"), "utf-8");
      const dataRow = content.split("\r\n")[1] || "";
      const columns = dataRow.split(";");
      // Column 16 is "Shared Parts - templates" (total non-empty)
      expect(Number(columns[16])).toBe(1);
    });
  });

  // ─── countYamlFiles (via getYamlSummary / getTemplatesSummary) ───────────────

  describe("countYamlFiles", () => {
    it("returns 0 counts when no YAML files exist", async () => {
      fsUtils.listExistingFiles.mockReturnValue([]);
      await generateOverview("2024-01-01");
      const content = fs.readFileSync(path.join(tempDir, "stats", "overview.csv"), "utf-8");
      const dataRow = content.split("\r\n")[1] || "";
      const columns = dataRow.split(";");
      // Column 10 is "Reconciliations - yaml files"
      expect(Number(columns[10])).toBe(0);
    });

    it("counts YAML files with unit tests", async () => {
      const yamlDir = path.join(tempDir, "reconciliation_texts", "rec_1", "tests");
      fs.mkdirSync(yamlDir, { recursive: true });
      const yamlPath = path.join(yamlDir, "rec_1_liquid_test.yml");
      fs.writeFileSync(yamlPath, YAML_TWO_TESTS);

      fsUtils.getAllTemplatesOfAType.mockReturnValue([]);
      fsUtils.listExistingFiles.mockImplementation((ext) => (ext === "yml" ? [yamlPath] : []));

      await generateOverview("2024-01-01");
      const content = fs.readFileSync(path.join(tempDir, "stats", "overview.csv"), "utf-8");
      const dataRow = content.split("\r\n")[1] || "";
      const columns = dataRow.split(";");
      // Column 11 is "Reconciliations - unit tests"
      expect(Number(columns[11])).toBe(2);
    });

    it("counts files with at least 2 tests correctly", async () => {
      const yamlDir1 = path.join(tempDir, "reconciliation_texts", "rec_1", "tests");
      fs.mkdirSync(yamlDir1, { recursive: true });
      const yamlPath1 = path.join(yamlDir1, "rec_1_liquid_test.yml");
      fs.writeFileSync(yamlPath1, YAML_TWO_TESTS); // 2 tests

      const yamlDir2 = path.join(tempDir, "reconciliation_texts", "rec_2", "tests");
      fs.mkdirSync(yamlDir2, { recursive: true });
      const yamlPath2 = path.join(yamlDir2, "rec_2_liquid_test.yml");
      fs.writeFileSync(yamlPath2, YAML_ONE_TEST); // 1 test

      fsUtils.getAllTemplatesOfAType.mockReturnValue([]);
      fsUtils.listExistingFiles.mockImplementation((ext) => (ext === "yml" ? [yamlPath1, yamlPath2] : []));

      await generateOverview("2024-01-01");
      const content = fs.readFileSync(path.join(tempDir, "stats", "overview.csv"), "utf-8");
      const dataRow = content.split("\r\n")[1] || "";
      const columns = dataRow.split(";");
      // Column 28 is "Reconciliations - yaml files with at least two tests"
      expect(Number(columns[28])).toBe(1);
    });

    it("skips YAML files with parse errors gracefully", async () => {
      const yamlDir = path.join(tempDir, "reconciliation_texts", "rec_bad", "tests");
      fs.mkdirSync(yamlDir, { recursive: true });
      const yamlPath = path.join(yamlDir, "rec_bad_liquid_test.yml");
      fs.writeFileSync(yamlPath, "invalid: yaml: content: :\n  broken: [unclosed");

      fsUtils.getAllTemplatesOfAType.mockReturnValue([]);
      fsUtils.listExistingFiles.mockImplementation((ext) => (ext === "yml" ? [yamlPath] : []));

      // Should not throw
      await expect(generateOverview("2024-01-01")).resolves.not.toThrow();
    });
  });
});
