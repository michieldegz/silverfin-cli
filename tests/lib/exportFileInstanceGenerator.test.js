jest.mock("consola");
jest.mock("../../lib/utils/apiUtils", () => ({ checkRequiredEnvVariables: jest.fn() }));
jest.mock("../../lib/api/sfApi", () => ({
  createExportFileInstance: jest.fn(),
  getExportFileInstance: jest.fn(),
}));
jest.mock("../../lib/utils/errorUtils", () => ({ errorHandler: jest.fn() }));
jest.mock("../../lib/utils/urlHandler", () => ({ UrlHandler: jest.fn() }));

const { consola } = require("consola");
const SF = require("../../lib/api/sfApi");
const errorUtils = require("../../lib/utils/errorUtils");
const { UrlHandler } = require("../../lib/utils/urlHandler");
const { ExportFileInstanceGenerator } = require("../../lib/exportFileInstanceGenerator");

describe("ExportFileInstanceGenerator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─── Constructor ──────────────────────────────────────────────────────────────

  describe("constructor", () => {
    it("throws when firmId is missing", () => {
      expect(() => new ExportFileInstanceGenerator(null, 200, 300, 55)).toThrow();
    });

    it("throws when companyId is missing", () => {
      expect(() => new ExportFileInstanceGenerator(100, null, 300, 55)).toThrow();
    });

    it("throws when periodId is missing", () => {
      expect(() => new ExportFileInstanceGenerator(100, 200, null, 55)).toThrow();
    });

    it("throws when exportFileId is missing", () => {
      expect(() => new ExportFileInstanceGenerator(100, 200, 300, null)).toThrow();
    });

    it("constructs successfully with all required parameters", () => {
      expect(() => new ExportFileInstanceGenerator(100, 200, 300, 55)).not.toThrow();
    });
  });

  // ─── generateAndOpenFile ──────────────────────────────────────────────────────

  describe("generateAndOpenFile", () => {
    let generator;

    beforeEach(() => {
      generator = new ExportFileInstanceGenerator(100, 200, 300, 55);
    });

    it("calls SF.createExportFileInstance with the correct parameters", async () => {
      SF.createExportFileInstance.mockResolvedValue(null);
      await generator.generateAndOpenFile();
      expect(SF.createExportFileInstance).toHaveBeenCalledWith(100, 200, 300, 55);
    });

    it("returns undefined (early exit) when createExportFileInstance returns falsy", async () => {
      SF.createExportFileInstance.mockResolvedValue(null);
      const result = await generator.generateAndOpenFile();
      expect(result).toBeUndefined();
      expect(SF.getExportFileInstance).not.toHaveBeenCalled();
    });

    it("returns undefined when createExportFileInstance returns object without id", async () => {
      SF.createExportFileInstance.mockResolvedValue({ state: "pending" });
      const result = await generator.generateAndOpenFile();
      expect(result).toBeUndefined();
      expect(SF.getExportFileInstance).not.toHaveBeenCalled();
    });

    it("stops polling and returns response when state is created", async () => {
      SF.createExportFileInstance.mockResolvedValue({ id: 77 });
      SF.getExportFileInstance.mockResolvedValue({ id: 77, state: "created", content_url: "https://example.com/file.pdf" });

      const openFileMock = jest.fn().mockResolvedValue();
      UrlHandler.mockImplementation(() => ({ openFile: openFileMock }));

      const promise = generator.generateAndOpenFile();
      await jest.runAllTimersAsync();
      await promise;

      expect(SF.getExportFileInstance).toHaveBeenCalledTimes(1);
    });

    it("stops polling and returns false when state is unexpected (not pending or created)", async () => {
      SF.createExportFileInstance.mockResolvedValue({ id: 77 });
      SF.getExportFileInstance.mockResolvedValue({ id: 77, state: "error" });

      const promise = generator.generateAndOpenFile();
      await jest.runAllTimersAsync();
      await promise;

      // Should stop after first unexpected state
      expect(SF.getExportFileInstance).toHaveBeenCalledTimes(1);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("unexpected state"));
    });

    it("polls multiple times while state is pending and increments attempts", async () => {
      SF.createExportFileInstance.mockResolvedValue({ id: 77 });
      SF.getExportFileInstance
        .mockResolvedValueOnce({ id: 77, state: "pending" })
        .mockResolvedValueOnce({ id: 77, state: "pending" })
        .mockResolvedValue({ id: 77, state: "created", content_url: null });

      const promise = generator.generateAndOpenFile();
      await jest.runAllTimersAsync();
      await promise;

      expect(SF.getExportFileInstance).toHaveBeenCalledTimes(3);
    });

    it("returns false after MAX_ATTEMPTS (25) without resolution", async () => {
      SF.createExportFileInstance.mockResolvedValue({ id: 77 });
      SF.getExportFileInstance.mockResolvedValue({ id: 77, state: "pending" });

      const promise = generator.generateAndOpenFile();
      await jest.runAllTimersAsync();
      await promise;

      expect(SF.getExportFileInstance).toHaveBeenCalledTimes(25);
    });

    it("calls consola.warn when validation_errors are present", async () => {
      SF.createExportFileInstance.mockResolvedValue({ id: 77 });
      SF.getExportFileInstance.mockResolvedValue({ id: 77, state: "created", validation_errors: ["error1"], content_url: null });

      const promise = generator.generateAndOpenFile();
      await jest.runAllTimersAsync();
      await promise;

      expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Validation errors"));
    });

    it("calls UrlHandler.openFile with content_url when state is created", async () => {
      SF.createExportFileInstance.mockResolvedValue({ id: 77 });
      SF.getExportFileInstance.mockResolvedValue({ id: 77, state: "created", content_url: "https://example.com/file.pdf" });

      const openFileMock = jest.fn().mockResolvedValue();
      UrlHandler.mockImplementation(() => ({ openFile: openFileMock }));

      const promise = generator.generateAndOpenFile();
      await jest.runAllTimersAsync();
      await promise;

      expect(UrlHandler).toHaveBeenCalledWith("https://example.com/file.pdf");
      expect(openFileMock).toHaveBeenCalled();
    });

    it("calls consola.error when state is created but content_url is missing", async () => {
      SF.createExportFileInstance.mockResolvedValue({ id: 77 });
      SF.getExportFileInstance.mockResolvedValue({ id: 77, state: "created", content_url: null });

      const promise = generator.generateAndOpenFile();
      await jest.runAllTimersAsync();
      await promise;

      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("No download URL"));
      expect(UrlHandler).not.toHaveBeenCalled();
    });

    it("calls errorUtils.errorHandler when an exception is thrown", async () => {
      SF.createExportFileInstance.mockRejectedValue(new Error("network failure"));

      await generator.generateAndOpenFile();

      expect(errorUtils.errorHandler).toHaveBeenCalledWith(expect.objectContaining({ message: "network failure" }));
    });
  });
});
