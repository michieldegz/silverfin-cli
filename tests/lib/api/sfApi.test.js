const axios = require("axios");
const AxiosMockAdapter = require("axios-mock-adapter");

jest.mock("consola");
jest.mock("../../../lib/utils/apiUtils", () => ({
  checkRequiredEnvVariables: jest.fn(),
  responseSuccessHandler: jest.fn(),
  responseErrorHandler: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../../lib/api/axiosFactory");
jest.mock("../../../lib/api/silverfinAuthorizer");

const { consola } = require("consola");
const apiUtils = require("../../../lib/utils/apiUtils");
const { AxiosFactory } = require("../../../lib/api/axiosFactory");
const { SilverfinAuthorizer } = require("../../../lib/api/silverfinAuthorizer");
const SF = require("../../../lib/api/sfApi");

describe("sfApi", () => {
  let mockAxios;
  let axiosInstance;
  let processExitSpy;

  beforeEach(() => {
    axiosInstance = axios.create();
    mockAxios = new AxiosMockAdapter(axiosInstance);
    AxiosFactory.createInstance.mockReturnValue(axiosInstance);
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    jest.clearAllMocks();
    // Reset mock after clearAllMocks so it still works
    AxiosFactory.createInstance.mockReturnValue(axiosInstance);
    apiUtils.responseErrorHandler.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mockAxios.restore();
    processExitSpy.mockRestore();
  });

  // ─── Module load ─────────────────────────────────────────────────────────────

  describe("module load", () => {
    it("calls checkRequiredEnvVariables when sfApi is required", () => {
      jest.isolateModules(() => {
        const freshApiUtils = require("../../../lib/utils/apiUtils");
        // Reset call count for this isolated test
        freshApiUtils.checkRequiredEnvVariables.mockClear();
        require("../../../lib/api/sfApi");
        expect(freshApiUtils.checkRequiredEnvVariables).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ─── Auth delegation ─────────────────────────────────────────────────────────

  describe("authorizeFirm", () => {
    it("delegates to SilverfinAuthorizer.authorizeFirm", async () => {
      await SF.authorizeFirm(100);
      expect(SilverfinAuthorizer.authorizeFirm).toHaveBeenCalledWith(100);
    });
  });

  describe("refreshFirmTokens", () => {
    it("delegates to SilverfinAuthorizer.refreshFirm and returns result", async () => {
      SilverfinAuthorizer.refreshFirm.mockResolvedValue("refreshed");
      const result = await SF.refreshFirmTokens(100);
      expect(SilverfinAuthorizer.refreshFirm).toHaveBeenCalledWith(100);
      expect(result).toBe("refreshed");
    });
  });

  describe("refreshPartnerToken", () => {
    it("delegates to SilverfinAuthorizer.refreshPartner and returns result", async () => {
      SilverfinAuthorizer.refreshPartner.mockResolvedValue("partner_refreshed");
      const result = await SF.refreshPartnerToken("partner_1");
      expect(SilverfinAuthorizer.refreshPartner).toHaveBeenCalledWith("partner_1");
      expect(result).toBe("partner_refreshed");
    });
  });

  // ─── ReconciliationText CRUD ─────────────────────────────────────────────────

  describe("createReconciliationText", () => {
    it("POSTs to reconciliations and calls responseSuccessHandler", async () => {
      mockAxios.onPost("reconciliations").reply(200, { id: 1 });
      await SF.createReconciliationText("firm", 100, { name: "test" });
      expect(apiUtils.responseSuccessHandler).toHaveBeenCalled();
    });

    it("returns the full response on success", async () => {
      mockAxios.onPost("reconciliations").reply(200, { id: 42 });
      const result = await SF.createReconciliationText("firm", 100, {});
      expect(result.data).toEqual({ id: 42 });
    });

    it("calls responseErrorHandler on HTTP error", async () => {
      mockAxios.onPost("reconciliations").reply(404);
      await SF.createReconciliationText("firm", 100, {});
      expect(apiUtils.responseErrorHandler).toHaveBeenCalled();
    });
  });

  describe("readReconciliationTexts", () => {
    it("GETs reconciliations with page and per_page params", async () => {
      mockAxios.onGet("reconciliations").reply(200, [{ id: 1 }]);
      await SF.readReconciliationTexts("firm", 100, 2);
      expect(mockAxios.history.get[0].params).toEqual({ page: 2, per_page: 200 });
    });

    it("defaults to page 1", async () => {
      mockAxios.onGet("reconciliations").reply(200, []);
      await SF.readReconciliationTexts("firm", 100);
      expect(mockAxios.history.get[0].params.page).toBe(1);
    });

    it("returns response.data (not the full response)", async () => {
      mockAxios.onGet("reconciliations").reply(200, [{ id: 1 }]);
      const result = await SF.readReconciliationTexts("firm", 100);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].id).toBe(1);
    });
  });

  describe("readReconciliationTextById", () => {
    it("GETs reconciliations/{id} and returns full response", async () => {
      mockAxios.onGet("reconciliations/42").reply(200, { id: 42 });
      const result = await SF.readReconciliationTextById("firm", 100, 42);
      expect(result.data).toEqual({ id: 42 });
    });
  });

  describe("updateReconciliationText", () => {
    it("POSTs to reconciliations/{id}", async () => {
      mockAxios.onPost("reconciliations/42").reply(200, { id: 42 });
      await SF.updateReconciliationText("firm", 100, 42, { name: "updated" });
      expect(mockAxios.history.post[0].url).toBe("reconciliations/42");
    });
  });

  describe("findReconciliationTextByHandle", () => {
    it("returns null when the page is empty", async () => {
      mockAxios.onGet("reconciliations").reply(200, []);
      const result = await SF.findReconciliationTextByHandle("firm", 100, "my_handle");
      expect(result).toBeNull();
    });

    it("skips templates with marketplace_template_id set", async () => {
      mockAxios
        .onGet("reconciliations")
        .replyOnce(200, [{ handle: "my_handle", marketplace_template_id: 99, text: "code" }])
        .onGet("reconciliations")
        .replyOnce(200, []); // second page empty → return null
      const result = await SF.findReconciliationTextByHandle("firm", 100, "my_handle");
      expect(result).toBeNull();
    });

    it("skips templates without text field (hidden code)", async () => {
      mockAxios
        .onGet("reconciliations")
        .replyOnce(200, [{ handle: "my_handle" }]) // no text field
        .onGet("reconciliations")
        .replyOnce(200, []);
      const result = await SF.findReconciliationTextByHandle("firm", 100, "my_handle");
      expect(result).toBeNull();
    });

    it("returns the matching non-marketplace template", async () => {
      const rec = { handle: "my_handle", text: "code", id: 5 };
      mockAxios.onGet("reconciliations").reply(200, [rec]);
      const result = await SF.findReconciliationTextByHandle("firm", 100, "my_handle");
      expect(result).toEqual(rec);
    });

    it("paginates when handle not found on the current page", async () => {
      const rec = { handle: "my_handle", text: "code", id: 5 };
      mockAxios
        .onGet("reconciliations")
        .replyOnce(200, [{ handle: "other", text: "code", id: 1 }])
        .onGet("reconciliations")
        .replyOnce(200, [rec]);
      const result = await SF.findReconciliationTextByHandle("firm", 100, "my_handle");
      expect(result).toEqual(rec);
    });
  });

  // ─── SharedPart CRUD ──────────────────────────────────────────────────────────

  describe("readSharedParts", () => {
    it("GETs shared_parts with page and per_page params", async () => {
      mockAxios.onGet("shared_parts").reply(200, []);
      await SF.readSharedParts("firm", 100, 3);
      expect(mockAxios.history.get[0].params).toEqual({ page: 3, per_page: 200 });
    });

    it("returns the full response object (not just .data)", async () => {
      // TODO: inconsistency — readReconciliationTexts returns response.data but
      // readSharedParts returns the full response; callers access response.data themselves.
      mockAxios.onGet("shared_parts").reply(200, [{ id: 1 }]);
      const result = await SF.readSharedParts("firm", 100);
      expect(result).toHaveProperty("data");
      expect(result.data).toEqual([{ id: 1 }]);
    });
  });

  describe("findSharedPartByName", () => {
    it("returns null when the page is empty", async () => {
      mockAxios.onGet("shared_parts").reply(200, []);
      const result = await SF.findSharedPartByName("firm", 100, "my_part");
      expect(result).toBeNull();
    });

    it("returns the matching shared part", async () => {
      const part = { id: 7, name: "my_part" };
      mockAxios.onGet("shared_parts").reply(200, [part]);
      const result = await SF.findSharedPartByName("firm", 100, "my_part");
      expect(result).toEqual(part);
    });

    it("paginates when name not found on the current page", async () => {
      const part = { id: 7, name: "my_part" };
      mockAxios
        .onGet("shared_parts")
        .replyOnce(200, [{ id: 1, name: "other" }])
        .onGet("shared_parts")
        .replyOnce(200, [part]);
      const result = await SF.findSharedPartByName("firm", 100, "my_part");
      expect(result).toEqual(part);
    });
  });

  describe("createSharedPart", () => {
    it("POSTs to shared_parts", async () => {
      mockAxios.onPost("shared_parts").reply(200, { id: 10 });
      await SF.createSharedPart("firm", 100, { name: "new_part" });
      expect(mockAxios.history.post[0].url).toBe("shared_parts");
    });
  });

  describe("updateSharedPart", () => {
    it("POSTs to shared_parts/{id}", async () => {
      mockAxios.onPost("shared_parts/10").reply(200, { id: 10 });
      await SF.updateSharedPart("firm", 100, 10, { name: "updated" });
      expect(mockAxios.history.post[0].url).toBe("shared_parts/10");
    });
  });

  describe("addSharedPartToReconciliation", () => {
    it("POSTs to reconciliations/{recId}/shared_parts/{spId}", async () => {
      mockAxios.onPost("reconciliations/5/shared_parts/10").reply(200, {});
      await SF.addSharedPartToReconciliation("firm", 100, 10, 5);
      expect(mockAxios.history.post[0].url).toBe("reconciliations/5/shared_parts/10");
    });
  });

  describe("removeSharedPartFromReconciliation", () => {
    it("DELETEs reconciliations/{recId}/shared_parts/{spId}", async () => {
      mockAxios.onDelete("reconciliations/5/shared_parts/10").reply(200, {});
      await SF.removeSharedPartFromReconciliation("firm", 100, 10, 5);
      expect(mockAxios.history.delete[0].url).toBe("reconciliations/5/shared_parts/10");
    });
  });

  // ─── ExportFile CRUD ──────────────────────────────────────────────────────────

  describe("readExportFiles", () => {
    it("GETs export_files with page and per_page and returns response.data", async () => {
      mockAxios.onGet("export_files").reply(200, [{ id: 1 }]);
      const result = await SF.readExportFiles("firm", 100);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("findExportFileByName", () => {
    it("returns null when page is empty", async () => {
      mockAxios.onGet("export_files").reply(200, []);
      const result = await SF.findExportFileByName("firm", 100, "my_export");
      expect(result).toBeNull();
    });

    it("makes a second GET call (readExportFileById) after finding name match", async () => {
      // TODO: inconsistency — findExportFileByName makes an extra HTTP call for the full record
      // while findSharedPartByName returns the list item directly.
      mockAxios.onGet("export_files").reply(200, [{ id: 3, name_nl: "my_export" }]);
      mockAxios.onGet("export_files/3").reply(200, { id: 3, name_nl: "my_export", text: "code" });
      const result = await SF.findExportFileByName("firm", 100, "my_export");
      expect(result).toEqual({ id: 3, name_nl: "my_export", text: "code" });
      expect(mockAxios.history.get).toHaveLength(2);
    });
  });

  describe("createExportFile", () => {
    it("POSTs to export_files", async () => {
      mockAxios.onPost("export_files").reply(200, { id: 20 });
      await SF.createExportFile("firm", 100, { name_nl: "new_export" });
      expect(mockAxios.history.post[0].url).toBe("export_files");
    });
  });

  describe("updateExportFile", () => {
    it("POSTs to export_files/{id}", async () => {
      mockAxios.onPost("export_files/20").reply(200, { id: 20 });
      await SF.updateExportFile("firm", 100, 20, { name_nl: "updated" });
      expect(mockAxios.history.post[0].url).toBe("export_files/20");
    });
  });

  // ─── AccountTemplate CRUD ─────────────────────────────────────────────────────

  describe("readAccountTemplates", () => {
    it("GETs account_templates and returns response.data", async () => {
      mockAxios.onGet("account_templates").reply(200, [{ id: 1 }]);
      const result = await SF.readAccountTemplates("firm", 100);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("findAccountTemplateByName", () => {
    it("returns null when page is empty", async () => {
      mockAxios.onGet("account_templates").reply(200, []);
      const result = await SF.findAccountTemplateByName("firm", 100, "my_template");
      expect(result).toBeNull();
    });

    it("makes a second GET for the full record after name match", async () => {
      mockAxios.onGet("account_templates").reply(200, [{ id: 8, name_nl: "my_template" }]);
      mockAxios.onGet("account_templates/8").reply(200, { id: 8, name_nl: "my_template" });
      const result = await SF.findAccountTemplateByName("firm", 100, "my_template");
      expect(result).toEqual({ id: 8, name_nl: "my_template" });
    });
  });

  describe("createAccountTemplate", () => {
    it("POSTs to account_templates", async () => {
      mockAxios.onPost("account_templates").reply(200, { id: 30 });
      await SF.createAccountTemplate("firm", 100, { name_nl: "new_template" });
      expect(mockAxios.history.post[0].url).toBe("account_templates");
    });
  });

  describe("updateAccountTemplate", () => {
    it("POSTs to account_templates/{id}", async () => {
      mockAxios.onPost("account_templates/30").reply(200, { id: 30 });
      await SF.updateAccountTemplate("firm", 100, 30, { name_nl: "updated" });
      expect(mockAxios.history.post[0].url).toBe("account_templates/30");
    });
  });

  // ─── Test runs ────────────────────────────────────────────────────────────────

  describe("createTestRun", () => {
    it("POSTs to reconciliations/test for reconciliationText type", async () => {
      mockAxios.onPost("reconciliations/test").reply(200, { id: 99 });
      await SF.createTestRun(100, { template: "code" }, "reconciliationText");
      expect(mockAxios.history.post[0].url).toBe("reconciliations/test");
    });

    it("POSTs to account_templates/test for accountTemplate type", async () => {
      mockAxios.onPost("account_templates/test").reply(200, { id: 99 });
      await SF.createTestRun(100, { template: "code" }, "accountTemplate");
      expect(mockAxios.history.post[0].url).toBe("account_templates/test");
    });

    it("calls consola.error and process.exit() for unknown templateType (BUG: no exit code)", async () => {
      // BUG: process.exit() called without argument — should be process.exit(1)
      await SF.createTestRun(100, {}, "unknownType");
      expect(consola.error).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalled();
    });
  });

  describe("createPreviewRun", () => {
    it("POSTs to reconciliations/render for reconciliationText type", async () => {
      mockAxios.onPost("reconciliations/render").reply(200, { id: 99 });
      await SF.createPreviewRun(100, {}, "reconciliationText");
      expect(mockAxios.history.post[0].url).toBe("reconciliations/render");
    });

    it("POSTs to account_templates/render for accountTemplate type", async () => {
      mockAxios.onPost("account_templates/render").reply(200, { id: 99 });
      await SF.createPreviewRun(100, {}, "accountTemplate");
      expect(mockAxios.history.post[0].url).toBe("account_templates/render");
    });
  });

  describe("readTestRun", () => {
    it("GETs reconciliations/test_runs/{id} for reconciliationText", async () => {
      mockAxios.onGet("reconciliations/test_runs/55").reply(200, { status: "completed" });
      await SF.readTestRun(100, 55, "reconciliationText");
      expect(mockAxios.history.get[0].url).toBe("reconciliations/test_runs/55");
    });

    it("GETs account_templates/test_runs/{id} for accountTemplate", async () => {
      mockAxios.onGet("account_templates/test_runs/55").reply(200, { status: "completed" });
      await SF.readTestRun(100, 55, "accountTemplate");
      expect(mockAxios.history.get[0].url).toBe("account_templates/test_runs/55");
    });
  });

  // ─── Periods / Workflows ──────────────────────────────────────────────────────

  describe("getPeriods", () => {
    it("GETs /companies/{cId}/periods with pagination params", async () => {
      mockAxios.onGet("/companies/200/periods").reply(200, []);
      await SF.getPeriods(100, 200, 2);
      expect(mockAxios.history.get[0].params).toEqual({ page: 2, per_page: 200 });
    });
  });

  describe("findPeriod", () => {
    it("returns the matching period from the array", () => {
      const periods = [{ id: 1 }, { id: 2 }, { id: 3 }];
      expect(SF.findPeriod(2, periods)).toEqual({ id: 2 });
    });

    it("returns undefined when the period id is not found", () => {
      expect(SF.findPeriod(99, [{ id: 1 }])).toBeUndefined();
    });
  });

  describe("getAllPeriodCustom", () => {
    it("accumulates items across pages until an empty page is returned", async () => {
      mockAxios
        .onGet("/companies/200/periods/300/custom")
        .replyOnce(200, new Array(200).fill({ key: "val" })) // full page
        .onGet("/companies/200/periods/300/custom")
        .replyOnce(200, [{ key: "last" }]); // partial page
      const result = await SF.getAllPeriodCustom(100, 200, 300);
      expect(result).toHaveLength(201);
    });

    it("stops at MAX_PAGES (50) and logs a warning", async () => {
      // Always return a full page so it never stops naturally
      mockAxios.onGet("/companies/200/periods/300/custom").reply(200, new Array(200).fill({ key: "val" }));
      const result = await SF.getAllPeriodCustom(100, 200, 300);
      expect(result).toHaveLength(50 * 200);
      expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("maximum page limit"));
    });

    it("handles null/undefined response gracefully (returns empty)", async () => {
      apiUtils.responseErrorHandler.mockResolvedValue(null);
      mockAxios.onGet("/companies/200/periods/300/custom").reply(404);
      const result = await SF.getAllPeriodCustom(100, 200, 300);
      expect(result).toEqual([]);
    });
  });

  describe("findReconciliationInWorkflows", () => {
    it("returns undefined and logs warning when not found in any workflow", async () => {
      mockAxios.onGet("/companies/200/periods/300/workflows").reply(200, [{ id: 1 }]);
      mockAxios.onGet("/companies/200/periods/300/workflows/1/reconciliations").reply(200, []);
      const result = await SF.findReconciliationInWorkflows(100, "missing_handle", 200, 300);
      expect(result).toBeUndefined();
      expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("missing_handle"));
    });

    it("returns the reconciliation when found in a workflow", async () => {
      const rec = { handle: "found_handle", id: 5 };
      mockAxios.onGet("/companies/200/periods/300/workflows").reply(200, [{ id: 1 }]);
      mockAxios.onGet("/companies/200/periods/300/workflows/1/reconciliations").reply(200, [rec]);
      const result = await SF.findReconciliationInWorkflows(100, "found_handle", 200, 300);
      expect(result).toEqual(rec);
    });
  });

  // ─── Other endpoints ──────────────────────────────────────────────────────────

  describe("verifyLiquid", () => {
    it("POSTs to reconciliations/verify_liquid with JSON Content-Type header", async () => {
      mockAxios.onPost("reconciliations/verify_liquid").reply(200, { valid: true });
      await SF.verifyLiquid(100, JSON.stringify({ template: "code" }));
      expect(mockAxios.history.post[0].headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("getFirmDetails", () => {
    it("GETs /user/firm and returns response.data", async () => {
      mockAxios.onGet("/user/firm").reply(200, { id: 100, name: "Test Firm" });
      const result = await SF.getFirmDetails(100);
      expect(result).toEqual({ id: 100, name: "Test Firm" });
    });
  });

  describe("createExportFileInstance", () => {
    it("POSTs to /companies/{cId}/periods/{pId}/export_file_instances with export_file_id", async () => {
      mockAxios.onPost("/companies/200/periods/300/export_file_instances").reply(200, { id: 77 });
      const result = await SF.createExportFileInstance(100, 200, 300, 55);
      expect(JSON.parse(mockAxios.history.post[0].data)).toEqual({ export_file_id: 55 });
      expect(result).toEqual({ id: 77 });
    });
  });

  describe("getExportFileInstance", () => {
    it("GETs /companies/{cId}/periods/{pId}/export_file_instances/{instanceId}", async () => {
      mockAxios.onGet("/companies/200/periods/300/export_file_instances/77").reply(200, { state: "created" });
      const result = await SF.getExportFileInstance(100, 200, 300, 77);
      expect(result).toEqual({ state: "created" });
    });
  });

  // ─── Error handling (shared pattern) ─────────────────────────────────────────

  describe("error handling", () => {
    test.each([
      ["createReconciliationText", () => SF.createReconciliationText("firm", 100, {}), "onPost", "reconciliations"],
      ["readReconciliationTexts", () => SF.readReconciliationTexts("firm", 100), "onGet", "reconciliations"],
      ["createSharedPart", () => SF.createSharedPart("firm", 100, {}), "onPost", "shared_parts"],
      ["createExportFile", () => SF.createExportFile("firm", 100, {}), "onPost", "export_files"],
      ["createAccountTemplate", () => SF.createAccountTemplate("firm", 100, {}), "onPost", "account_templates"],
    ])("%s calls responseErrorHandler on network error", async (name, fn, method, url) => {
      mockAxios[method](url).networkError();
      await fn();
      expect(apiUtils.responseErrorHandler).toHaveBeenCalled();
    });
  });
});
