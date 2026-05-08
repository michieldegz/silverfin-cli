const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const templateUtils = require("../../../lib/utils/templateUtils");
const { SharedPart } = require("../../../lib/templates/sharedPart");
const {
  SP_PARTNER,
  SP_WITH_USED_IN,
  DISK_CONFIG_EXISTING,
  DISK_CONFIG_LEGACY_USED_IN,
  DISK_CONFIG_FOR_UPDATE_ID,
} = require("../../fixtures/shared_parts");

jest.mock("../../../lib/utils/templateUtils");
jest.mock("consola");
jest.mock("../../../lib/utils/apiUtils", () => ({
  checkRequiredEnvVariables: jest.fn(() => true),
}));
jest.mock("../../../lib/api/sfApi", () => ({
  readReconciliationTextById: jest.fn(),
  readExportFileById: jest.fn(),
  readAccountTemplateById: jest.fn(),
}));

const SF = require("../../../lib/api/sfApi");

describe("SharedPart", () => {
  describe("save", () => {
    const template = {
      id: 808080,
      name: "example_shared_part_name",
      text: "example_shared_part_name.liquid",
      used_in: [],
      externally_managed: true,
    };
    const name = template.name;
    const configToWrite = {
      id: { 100: 808080 },
      partner_id: {},
      name: "example_shared_part_name",
      text: "example_shared_part_name.liquid",
      used_in: [],
      externally_managed: true,
    };

    const repoRoot = path.resolve(__dirname, "../../..");
    let tempDir;
    let expectedFolderPath;
    let mainLiquidPath;
    let configPath;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
      process.chdir(tempDir);

      expectedFolderPath = path.join(tempDir, "shared_parts", name);
      mainLiquidPath = path.join(expectedFolderPath, `${name}.liquid`);
      configPath = path.join(expectedFolderPath, "config.json");
    });

    afterEach(() => {
      process.chdir(repoRoot);
      if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      jest.resetAllMocks();
    });

    it("should return false if the template name is invalid", async () => {
      templateUtils.checkValidName.mockReturnValue(false);
      const result = await SharedPart.save("firm", 100, template);
      expect(result).toBe(false);
      expect(templateUtils.checkValidName).toHaveBeenCalledWith("example_shared_part_name", "sharedPart");
    });

    it("should create the necessary files and store template's relevant details", async () => {
      templateUtils.checkValidName.mockReturnValue(true);

      await SharedPart.save("firm", 100, template);

      // Check folder creation
      expect(fs.existsSync(expectedFolderPath)).toBe(true);
      // Check main liquid file
      expect(fs.existsSync(mainLiquidPath)).toBe(true);
      const mainLiquidContent = await fsPromises.readFile(mainLiquidPath, "utf-8");
      expect(mainLiquidContent).toBe(template.text);
      // Check config file
      expect(fs.existsSync(configPath)).toBe(true);
      const configSaved = JSON.parse(await fsPromises.readFile(configPath, "utf-8"));
      expect(configSaved).toEqual(configToWrite);
    });
  });

  describe("read", () => {
    const name = "example_shared_part_name";
    const repoRoot = path.resolve(__dirname, "../../..");
    let tempDir;
    let expectedFolderPath;
    let mainLiquidPath;
    let configPath;

    const configContent = {
      id: { 100: 808080 },
      partner_id: {},
      name: "example_shared_part_name",
      text: "example_shared_part_name.liquid",
      used_in: [],
      externally_managed: true,
    };

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
      process.chdir(tempDir);

      expectedFolderPath = path.join(tempDir, "shared_parts", name);
      mainLiquidPath = path.join(expectedFolderPath, `${name}.liquid`);
      configPath = path.join(expectedFolderPath, "config.json");

      // Create necessary directories and files
      fs.mkdirSync(expectedFolderPath, { recursive: true });
      fs.mkdirSync(path.join(expectedFolderPath, "shared_parts"), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(configContent));
      fs.writeFileSync(mainLiquidPath, "Main liquid content");

      // Mock valid handle check
      templateUtils.checkValidName.mockReturnValue(true);
    });

    afterEach(() => {
      process.chdir(repoRoot);
      if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      jest.resetAllMocks();
    });

    it("should create the liquid file if it doesn't exist", async () => {
      await fsPromises.unlink(mainLiquidPath);

      SharedPart.read(name);

      expect(fs.existsSync(mainLiquidPath)).toBe(true);
      const content = await fsPromises.readFile(mainLiquidPath, "utf-8");
      expect(content).toBe("{% comment %} MAIN PART {% endcomment %}");
    });

    it("should return false when name is invalid", async () => {
      templateUtils.checkValidName.mockReturnValue(false);
      const result = await SharedPart.read(name);
      expect(result).toBe(false);
    });

    it("should read config.json and return only CONFIG_ITEMS keys", async () => {
      const result = await SharedPart.read(name);
      // CONFIG_ITEMS = ["name", "externally_managed", "hide_code"]
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("externally_managed");
      // Should NOT include id or partner_id (not in CONFIG_ITEMS)
      expect(result).not.toHaveProperty("id");
      expect(result).not.toHaveProperty("partner_id");
    });

    it("should read the liquid content from the named liquid file", async () => {
      const result = await SharedPart.read(name);
      expect(result.text).toBe("Main liquid content");
    });
  });

  // ─── save (additional cases) ──────────────────────────────────────────────────

  describe("save (additional cases)", () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    let tempDir;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
      process.chdir(tempDir);
      templateUtils.checkValidName.mockReturnValue(true);
    });

    afterEach(() => {
      process.chdir(repoRoot);
      if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      jest.resetAllMocks();
    });

    it("should save with partner type (stores id under partner_id key)", async () => {
      await SharedPart.save("partner", "partner_1", SP_PARTNER);
      const configPath = path.join(tempDir, "shared_parts", SP_PARTNER.name, "config.json");
      const saved = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      expect(saved.partner_id).toEqual({ partner_1: SP_PARTNER.id });
      expect(saved.id).toEqual({});
    });

    it("should merge with existing config when file already exists", async () => {
      // Pre-create a config for firm 100 using the DISK_CONFIG_EXISTING fixture
      const name = DISK_CONFIG_EXISTING.name;
      const folder = path.join(tempDir, "shared_parts", name);
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(path.join(folder, "config.json"), JSON.stringify(DISK_CONFIG_EXISTING));

      const template = { id: 222, name, text: "new code", used_in: [], externally_managed: false };
      await SharedPart.save("firm", 200, template);

      const saved = JSON.parse(fs.readFileSync(path.join(folder, "config.json"), "utf-8"));
      expect(saved.id).toEqual({ ...DISK_CONFIG_EXISTING.id, 200: 222 });
    });

    it("should write used_in entries after resolving handles via sfApi", async () => {
      SF.readReconciliationTextById.mockResolvedValue({ data: { handle: "rec_handle" } });
      await SharedPart.save("firm", 100, SP_WITH_USED_IN);
      const configPath = path.join(tempDir, "shared_parts", SP_WITH_USED_IN.name, "config.json");
      const saved = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      expect(saved.used_in).toHaveLength(1);
      expect(saved.used_in[0].handle).toBe("rec_handle");
    });

    it("should skip used_in entries with legacy numeric id format", async () => {
      // Pre-create config with legacy used_in entry (id as number, not object) using DISK_CONFIG_LEGACY_USED_IN
      const name = DISK_CONFIG_LEGACY_USED_IN.name;
      const folder = path.join(tempDir, "shared_parts", name);
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(path.join(folder, "config.json"), JSON.stringify(DISK_CONFIG_LEGACY_USED_IN));

      const firmId = Object.keys(DISK_CONFIG_LEGACY_USED_IN.id)[0];
      const templateId = DISK_CONFIG_LEGACY_USED_IN.id[firmId];
      const template = { id: templateId, name, text: "code", used_in: [], externally_managed: false };
      await SharedPart.save("firm", Number(firmId), template);

      const saved = JSON.parse(fs.readFileSync(path.join(folder, "config.json"), "utf-8"));
      // Legacy entry should be filtered out
      expect(saved.used_in.every((entry) => typeof entry.id !== "number")).toBe(true);
    });
  });

  // ─── updateTemplateId ─────────────────────────────────────────────────────────

  describe("updateTemplateId", () => {
    const repoRoot = path.resolve(__dirname, "../../..");
    let tempDir;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
      process.chdir(tempDir);
      templateUtils.checkValidName.mockReturnValue(true);
    });

    afterEach(() => {
      process.chdir(repoRoot);
      if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
      jest.resetAllMocks();
    });

    it("should read existing config, set id for given type/envId, and write back", () => {
      const name = DISK_CONFIG_FOR_UPDATE_ID.name;
      const folder = path.join(tempDir, "shared_parts", name);
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(path.join(folder, "config.json"), JSON.stringify(DISK_CONFIG_FOR_UPDATE_ID));

      SharedPart.updateTemplateId("firm", 100, name, 9999);

      const saved = JSON.parse(fs.readFileSync(path.join(folder, "config.json"), "utf-8"));
      expect(saved.id["100"]).toBe(9999);
    });
  });

  // ─── checkTemplateType ────────────────────────────────────────────────────────

  describe("checkTemplateType", () => {
    it("leaves already-valid type unchanged", () => {
      const template = { id: 1, type: "reconciliationText" };
      expect(SharedPart.checkTemplateType(template).type).toBe("reconciliationText");
    });

    it("maps legacy 'reconciliation' type to reconciliationText", () => {
      const template = { id: 1, type: "reconciliation" };
      expect(SharedPart.checkTemplateType(template).type).toBe("reconciliationText");
    });

    it("maps legacy 'account_detail_template' to accountTemplate", () => {
      const template = { id: 1, type: "account_detail_template" };
      expect(SharedPart.checkTemplateType(template).type).toBe("accountTemplate");
    });
  });
});
