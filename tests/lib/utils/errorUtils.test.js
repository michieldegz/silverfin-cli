jest.mock("consola");
jest.mock("chalk", () => ({
  bold: (str) => str,
}));

const { consola } = require("consola");
const errorUtils = require("../../../lib/utils/errorUtils");

describe("errorUtils", () => {
  let processExitSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
    // Re-set spies after clearAllMocks
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    processExitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // ─── uncaughtErrors ───────────────────────────────────────────────────────────

  describe("uncaughtErrors", () => {
    it("calls console.error with a GitHub issues link and version info when error has a stack", () => {
      const error = new Error("something went wrong");
      errorUtils.uncaughtErrors(error);
      const allCalls = consoleErrorSpy.mock.calls.flat().join(" ");
      expect(allCalls).toContain("github.com");
      expect(allCalls).toContain("silverfin");
    });

    it("calls consola.error with the error message", () => {
      const error = new Error("test message");
      errorUtils.uncaughtErrors(error);
      expect(consola.error).toHaveBeenCalledWith("test message");
    });

    it("calls process.exit(1)", () => {
      const error = new Error("fail");
      errorUtils.uncaughtErrors(error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("does not call console.error with stack content when error.stack is falsy", () => {
      const error = { message: "no stack", stack: null };
      errorUtils.uncaughtErrors(error);
      // process.exit(1) should still be called
      expect(processExitSpy).toHaveBeenCalledWith(1);
      // console.error should not have been called (no stack block)
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  // ─── errorHandler ─────────────────────────────────────────────────────────────

  describe("errorHandler", () => {
    it("calls consola.error with the path for ENOENT errors and exits", () => {
      const enoentError = { code: "ENOENT", path: "/some/missing/file.json" };
      errorUtils.errorHandler(enoentError);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("/some/missing/file.json"));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("calls uncaughtErrors for non-ENOENT errors", () => {
      const genericError = new Error("unknown error");
      errorUtils.errorHandler(genericError);
      // uncaughtErrors calls process.exit(1)
      expect(processExitSpy).toHaveBeenCalledWith(1);
      // uncaughtErrors calls consola.error with the message
      expect(consola.error).toHaveBeenCalledWith("unknown error");
    });
  });

  // ─── missingConfig ────────────────────────────────────────────────────────────

  describe("missingConfig", () => {
    it("logs an error containing the identifier and exits with 1", () => {
      errorUtils.missingConfig("my_template");
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("my_template"));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  // ─── missingReconciliationId ──────────────────────────────────────────────────

  describe("missingReconciliationId", () => {
    it("logs an error containing the handle", () => {
      errorUtils.missingReconciliationId("my_handle");
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("my_handle"));
    });

    it("logs a hint command containing the handle", () => {
      errorUtils.missingReconciliationId("my_handle");
      expect(consola.log).toHaveBeenCalledWith(expect.stringContaining("my_handle"));
    });

    it("returns false", () => {
      expect(errorUtils.missingReconciliationId("my_handle")).toBe(false);
    });
  });

  // ─── missingSharedPartId ──────────────────────────────────────────────────────

  describe("missingSharedPartId", () => {
    it("logs an error containing the name", () => {
      errorUtils.missingSharedPartId("my_shared_part");
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("my_shared_part"));
    });

    it("returns false", () => {
      expect(errorUtils.missingSharedPartId("my_shared_part")).toBe(false);
    });
  });

  // ─── missingExportFileId ──────────────────────────────────────────────────────

  describe("missingExportFileId", () => {
    it("logs an error containing the name", () => {
      errorUtils.missingExportFileId("my_export");
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("my_export"));
    });

    it("returns false", () => {
      expect(errorUtils.missingExportFileId("my_export")).toBe(false);
    });
  });

  // ─── missingAccountTemplateId ─────────────────────────────────────────────────

  describe("missingAccountTemplateId", () => {
    it("logs an error containing the name", () => {
      errorUtils.missingAccountTemplateId("my_account_template");
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("my_account_template"));
    });

    it("returns false", () => {
      expect(errorUtils.missingAccountTemplateId("my_account_template")).toBe(false);
    });
  });
});
