jest.mock("consola");
jest.mock("chalk", () => ({
  red: (s) => s,
  green: (s) => s,
  blue: { bold: (s) => s },
  bold: (s) => s,
  italic: (s) => s,
}));
jest.mock("../../lib/utils/apiUtils", () => ({ checkRequiredEnvVariables: jest.fn() }));
jest.mock("../../lib/api/sfApi", () => ({
  createTestRun: jest.fn(),
  createPreviewRun: jest.fn(),
  readTestRun: jest.fn(),
}));
jest.mock("../../lib/cli/spinner", () => ({ spinner: { spin: jest.fn(), stop: jest.fn() } }));
jest.mock("../../lib/utils/fsUtils", () => ({
  configExists: jest.fn(),
  readConfig: jest.fn(),
  listSharedPartsUsedInTemplate: jest.fn().mockReturnValue([]),
  FOLDERS: { reconciliationText: "reconciliation_texts", sharedPart: "shared_parts", exportFile: "export_files", accountTemplate: "account_templates" },
  TEMPLATE_TYPES: ["reconciliationText", "sharedPart", "exportFile", "accountTemplate"],
}));
jest.mock("../../lib/utils/errorUtils", () => ({ errorHandler: jest.fn() }));
jest.mock("../../lib/utils/urlHandler", () => ({ UrlHandler: jest.fn().mockImplementation(() => ({ openFile: jest.fn() })) }));
jest.mock("../../lib/templates/reconciliationText", () => ({
  ReconciliationText: { read: jest.fn().mockReturnValue({ text: "liquid code", text_parts: [] }) },
}));
jest.mock("../../lib/templates/accountTemplate", () => ({
  AccountTemplate: { read: jest.fn().mockReturnValue({ text: "liquid code", text_parts: [] }) },
}));

const fs = require("fs");
const path = require("path");
const { consola } = require("consola");
const SF = require("../../lib/api/sfApi");
const fsUtils = require("../../lib/utils/fsUtils");
const { spinner } = require("../../lib/cli/spinner");
const { checkAllTestsErrorsPresent, runTests, runTestsWithOutput, runTestsStatusOnly, getHTML } = require("../../lib/liquidTestRunner");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SIMPLE_YAML = `test_case_1:
  context:
    period: 2023
  expectation:
    reconciled: false

test_case_2:
  context:
    period: 2022
  expectation:
    reconciled: true`;

const makePassingTestRun = (names = ["test_1"]) => ({
  status: "completed",
  tests: Object.fromEntries(names.map((n) => [n, { reconciled: null, results: {}, rollforwards: {} }])),
});

const makeFailingTestRun = (testName = "test_1") => ({
  status: "completed",
  tests: {
    [testName]: {
      reconciled: { got: false, expected: true, line_number: 5 },
      results: {},
      rollforwards: {},
    },
  },
});

// ─── checkAllTestsErrorsPresent ────────────────────────────────────────────────

describe("checkAllTestsErrorsPresent", () => {
  it("returns false when reconciled is null and results/rollforwards are empty", () => {
    const feedback = { test_1: { reconciled: null, results: {}, rollforwards: {} } };
    expect(checkAllTestsErrorsPresent(feedback)).toBe(false);
  });

  it("returns true when reconciled is non-null (has errors)", () => {
    const feedback = { test_1: { reconciled: { got: false, expected: true }, results: {}, rollforwards: {} } };
    expect(checkAllTestsErrorsPresent(feedback)).toBe(true);
  });

  it("returns true when results has keys", () => {
    const feedback = { test_1: { reconciled: null, results: { "result_key": { got: 1, expected: 2 } }, rollforwards: {} } };
    expect(checkAllTestsErrorsPresent(feedback)).toBe(true);
  });

  it("returns true when rollforwards has keys", () => {
    const feedback = { test_1: { reconciled: null, results: {}, rollforwards: { "rf_key": { got: 1, expected: 2 } } } };
    expect(checkAllTestsErrorsPresent(feedback)).toBe(true);
  });

  it("stops checking after finding the first error", () => {
    const feedback = {
      test_1: { reconciled: { got: false, expected: true }, results: {}, rollforwards: {} },
      test_2: { reconciled: null, results: {}, rollforwards: {} },
    };
    expect(checkAllTestsErrorsPresent(feedback)).toBe(true);
  });

  it("returns false for multiple passing tests", () => {
    const feedback = {
      test_1: { reconciled: null, results: {}, rollforwards: {} },
      test_2: { reconciled: null, results: {}, rollforwards: {} },
    };
    expect(checkAllTestsErrorsPresent(feedback)).toBe(false);
  });
});

// ─── runTests ─────────────────────────────────────────────────────────────────

describe("runTests", () => {
  let tempDir;
  const repoRoot = path.resolve(__dirname, "../..");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
    process.chdir(tempDir);
    fsUtils.listSharedPartsUsedInTemplate.mockReturnValue([]);
  });

  afterEach(() => {
    process.chdir(repoRoot);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    jest.useRealTimers();
  });

  it("calls process.exit for invalid templateType", async () => {
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    await runTests(100, "invalidType", "my_rec");
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("returns undefined when config is not found", async () => {
    fsUtils.configExists.mockReturnValue(false);
    const result = await runTests(100, "reconciliationText", "my_rec");
    expect(result).toBeUndefined();
  });

  it("returns undefined when test YAML file is not found", async () => {
    fsUtils.configExists.mockReturnValue(true);
    fsUtils.readConfig.mockReturnValue({ test: "tests/my_rec_liquid_test.yml", reconciliation_type: "reconciliation" });
    const result = await runTests(100, "reconciliationText", "my_rec");
    expect(result).toBeUndefined();
  });

  it("creates a test run and returns results", async () => {
    // Set up filesystem with a YAML file
    const testDir = path.join(tempDir, "reconciliation_texts", "my_rec", "tests");
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, "my_rec_liquid_test.yml"), SIMPLE_YAML);

    fsUtils.configExists.mockReturnValue(true);
    fsUtils.readConfig.mockReturnValue({ test: "tests/my_rec_liquid_test.yml", reconciliation_type: "reconciliation" });

    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: makePassingTestRun() });

    const promise = runTests(100, "reconciliationText", "my_rec", "", false, "none");
    await jest.runAllTimersAsync();
    const result = await promise;

    expect(SF.createTestRun).toHaveBeenCalled();
    expect(result.testRun.status).toBe("completed");
  });

  it("includes shared parts in template content when they exist", async () => {
    const testDir = path.join(tempDir, "reconciliation_texts", "my_rec", "tests");
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, "my_rec_liquid_test.yml"), SIMPLE_YAML);

    const sharedDir = path.join(tempDir, "shared_parts", "my_shared_part");
    fs.mkdirSync(sharedDir, { recursive: true });
    fs.writeFileSync(path.join(sharedDir, "my_shared_part.liquid"), "{% shared part liquid %}");

    fsUtils.configExists.mockReturnValue(true);
    fsUtils.readConfig.mockReturnValue({ test: "tests/my_rec_liquid_test.yml", reconciliation_type: "reconciliation" });
    fsUtils.listSharedPartsUsedInTemplate.mockReturnValue(["my_shared_part"]);

    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: makePassingTestRun() });

    const promise = runTests(100, "reconciliationText", "my_rec", "", false, "none");
    await jest.runAllTimersAsync();
    await promise;

    const testParams = SF.createTestRun.mock.calls[0][1];
    expect(testParams.template.text_shared_parts).toHaveLength(1);
    expect(testParams.template.text_shared_parts[0].name).toBe("my_shared_part");
  });
});

// ─── runTestsWithOutput ────────────────────────────────────────────────────────

describe("runTestsWithOutput", () => {
  let tempDir;
  const repoRoot = path.resolve(__dirname, "../..");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
    process.chdir(tempDir);
    fsUtils.listSharedPartsUsedInTemplate.mockReturnValue([]);
  });

  afterEach(() => {
    process.chdir(repoRoot);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    jest.useRealTimers();
  });

  const setupTestFiles = () => {
    const testDir = path.join(tempDir, "reconciliation_texts", "my_rec", "tests");
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, "my_rec_liquid_test.yml"), SIMPLE_YAML);
    fsUtils.configExists.mockReturnValue(true);
    fsUtils.readConfig.mockReturnValue({ test: "tests/my_rec_liquid_test.yml", reconciliation_type: "reconciliation" });
  };

  it("logs ALL TESTS HAVE PASSED when completed with no errors", async () => {
    setupTestFiles();
    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: makePassingTestRun() });

    const promise = runTestsWithOutput(100, "reconciliationText", "my_rec");
    await jest.runAllTimersAsync();
    await promise;

    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining("ALL TESTS HAVE PASSED"));
  });

  it("logs test_error message when status is test_error", async () => {
    setupTestFiles();
    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: { status: "test_error", error_message: "syntax error in template" } });

    const promise = runTestsWithOutput(100, "reconciliationText", "my_rec");
    await jest.runAllTimersAsync();
    await promise;

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("error"));
  });

  it("logs internal_error message when status is internal_error", async () => {
    setupTestFiles();
    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: { status: "internal_error" } });

    const promise = runTestsWithOutput(100, "reconciliationText", "my_rec");
    await jest.runAllTimersAsync();
    await promise;

    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("Internal error"));
  });

  it("logs failure details for failed tests", async () => {
    setupTestFiles();
    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: makeFailingTestRun("test_case_1") });

    const promise = runTestsWithOutput(100, "reconciliationText", "my_rec");
    await jest.runAllTimersAsync();
    await promise;

    expect(consola.log).toHaveBeenCalledWith(expect.stringContaining("FAILED"));
  });

  it("logs SUCCESSFULLY RENDERED HTML when previewOnly=true with htmlPreview=true and no errors", async () => {
    setupTestFiles();
    SF.createPreviewRun.mockResolvedValue({ data: 88 });
    // readTestRun is called for the preview run — must return passing data
    SF.readTestRun.mockResolvedValue({ data: makePassingTestRun() });

    // previewOnly=true, htmlInput=false, htmlPreview=true → renderMode="preview"
    const promise = runTestsWithOutput(100, "reconciliationText", "my_rec", "", true, false, true);
    await jest.runAllTimersAsync();
    await promise;

    expect(consola.success).toHaveBeenCalledWith(expect.stringContaining("SUCCESSFULLY RENDERED HTML"));
  });
});

// ─── runTestsStatusOnly ────────────────────────────────────────────────────────

describe("runTestsStatusOnly", () => {
  let tempDir;
  const repoRoot = path.resolve(__dirname, "../..");

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    tempDir = fs.mkdtempSync(path.join(repoRoot, "tmp-"));
    process.chdir(tempDir);
    fsUtils.listSharedPartsUsedInTemplate.mockReturnValue([]);
  });

  afterEach(() => {
    process.chdir(repoRoot);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    jest.useRealTimers();
  });

  const setupYaml = (handle) => {
    const testDir = path.join(tempDir, "reconciliation_texts", handle, "tests");
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, `${handle}_liquid_test.yml`), SIMPLE_YAML);
    fsUtils.configExists.mockReturnValue(true);
    fsUtils.readConfig.mockReturnValue({ test: `tests/${handle}_liquid_test.yml`, reconciliation_type: "reconciliation" });
  };

  it("calls process.exit for invalid templateType", async () => {
    const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    await runTestsStatusOnly(100, "badType", ["my_rec"]);
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("returns PASSED when all handles pass", async () => {
    setupYaml("my_rec");
    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: makePassingTestRun() });

    const promise = runTestsStatusOnly(100, "reconciliationText", ["my_rec"]);
    await jest.runAllTimersAsync();
    const status = await promise;

    expect(status).toBe("PASSED");
  });

  it("returns FAILED when any handle fails", async () => {
    setupYaml("my_rec");
    SF.createTestRun.mockResolvedValue({ data: 99 });
    SF.readTestRun.mockResolvedValue({ data: makeFailingTestRun("test_case_1") });

    const promise = runTestsStatusOnly(100, "reconciliationText", ["my_rec"]);
    await jest.runAllTimersAsync();
    const status = await promise;

    expect(status).toBe("FAILED");
  });
});

// ─── getHTML ──────────────────────────────────────────────────────────────────

describe("getHTML", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not call UrlHandler when openBrowser is false", async () => {
    const { UrlHandler } = require("../../lib/utils/urlHandler");
    await getHTML("https://example.com/file.html", "test_1", false, "input");
    expect(UrlHandler).not.toHaveBeenCalled();
  });

  it("calls UrlHandler.openFile with the url when openBrowser is true", async () => {
    const { UrlHandler } = require("../../lib/utils/urlHandler");
    const openFileMock = jest.fn().mockResolvedValue();
    UrlHandler.mockImplementation(() => ({ openFile: openFileMock }));
    await getHTML("https://example.com/file.html", "test_1", true, "input");
    expect(UrlHandler).toHaveBeenCalledWith("https://example.com/file.html", "test_1_input");
    expect(openFileMock).toHaveBeenCalled();
  });
});
