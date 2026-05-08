jest.mock("consola");
jest.mock("../../../lib/api/firmCredentials", () => ({
  firmCredentials: {
    getDefaultFirmId: jest.fn(),
    getHost: jest.fn(),
    SF_DEFAULT_HOST: "https://live.getsilverfin.com",
  },
}));
jest.mock("../../../lib/utils/errorUtils", () => ({
  uncaughtErrors: jest.fn(),
}));
// Mock prompt-sync to return a controllable value
const mockPrompt = jest.fn();
jest.mock("prompt-sync", () => () => mockPrompt);

const { consola } = require("consola");
const { firmCredentials } = require("../../../lib/api/firmCredentials");
const cliUtils = require("../../../lib/cli/utils");

describe("cli/utils", () => {
  let processExitSpy;

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    jest.clearAllMocks();
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    firmCredentials.getHost.mockReturnValue("https://live.getsilverfin.com");
  });

  afterEach(() => {
    processExitSpy.mockRestore();
  });

  // ─── loadDefaultFirmId ────────────────────────────────────────────────────────

  describe("loadDefaultFirmId", () => {
    it("returns stored default firm id from firmCredentials", () => {
      firmCredentials.getDefaultFirmId.mockReturnValue(123);
      expect(cliUtils.loadDefaultFirmId()).toBe(123);
    });

    it("falls back to SF_FIRM_ID env variable when no stored config", () => {
      firmCredentials.getDefaultFirmId.mockReturnValue(undefined);
      const saved = process.env.SF_FIRM_ID;
      process.env.SF_FIRM_ID = "456";
      expect(cliUtils.loadDefaultFirmId()).toBe("456");
      process.env.SF_FIRM_ID = saved;
    });

    it("prefers firmCredentials over SF_FIRM_ID env var", () => {
      firmCredentials.getDefaultFirmId.mockReturnValue(789);
      const saved = process.env.SF_FIRM_ID;
      process.env.SF_FIRM_ID = "999";
      expect(cliUtils.loadDefaultFirmId()).toBe(789);
      process.env.SF_FIRM_ID = saved;
    });

    it("returns undefined when neither source has a value", () => {
      firmCredentials.getDefaultFirmId.mockReturnValue(undefined);
      const saved = process.env.SF_FIRM_ID;
      delete process.env.SF_FIRM_ID;
      expect(cliUtils.loadDefaultFirmId()).toBeUndefined();
      if (saved !== undefined) process.env.SF_FIRM_ID = saved;
    });
  });

  // ─── checkDefaultFirm ─────────────────────────────────────────────────────────

  describe("checkDefaultFirm", () => {
    it("calls consola.info when firmUsed equals firmIdDefault", () => {
      cliUtils.checkDefaultFirm(100, 100);
      expect(consola.info).toHaveBeenCalledWith(expect.stringContaining("100"));
    });

    it("does not call consola.info when firmUsed differs from firmIdDefault", () => {
      cliUtils.checkDefaultFirm(100, 200);
      expect(consola.info).not.toHaveBeenCalled();
    });
  });

  // ─── formatOption ─────────────────────────────────────────────────────────────

  describe("formatOption", () => {
    it("converts camelCase to kebab-case", () => {
      expect(cliUtils.formatOption("listAll")).toBe("list-all");
    });

    it("converts single uppercase letter correctly", () => {
      expect(cliUtils.formatOption("allFirms")).toBe("all-firms");
    });

    it("returns lowercase words unchanged", () => {
      expect(cliUtils.formatOption("firm")).toBe("firm");
    });

    it("handles multiple uppercase letters", () => {
      expect(cliUtils.formatOption("myExportFile")).toBe("my-export-file");
    });
  });

  // ─── checkUniqueOption ────────────────────────────────────────────────────────

  describe("checkUniqueOption", () => {
    it("calls process.exit when none of the unique options are present", () => {
      cliUtils.checkUniqueOption(["handle", "id"], { firm: 100 });
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("must be used"));
    });

    it("calls process.exit when more than one unique option is present", () => {
      cliUtils.checkUniqueOption(["handle", "id"], { handle: "my_rec", id: 5, firm: 100 });
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("incompatible"));
    });

    it("returns true when exactly one unique option is used", () => {
      const result = cliUtils.checkUniqueOption(["handle", "id"], { handle: "my_rec", firm: 100 });
      expect(result).toBe(true);
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("includes formatted flag names in the error message", () => {
      cliUtils.checkUniqueOption(["listAll", "handle"], { firm: 100 });
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("list-all"));
    });
  });

  // ─── checkRequiredFirmOrPartner ───────────────────────────────────────────────

  describe("checkRequiredFirmOrPartner", () => {
    it("calls process.exit when a required option is used without firm or partner", () => {
      cliUtils.checkRequiredFirmOrPartner({ handle: "my_rec" }, ["handle"]);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("returns true when firm is provided with a required option", () => {
      const result = cliUtils.checkRequiredFirmOrPartner({ handle: "my_rec", firm: 100 }, ["handle"]);
      expect(result).toBe(true);
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("returns true when partner is provided with a required option", () => {
      const result = cliUtils.checkRequiredFirmOrPartner({ handle: "my_rec", partner: "p1" }, ["handle"]);
      expect(result).toBe(true);
    });

    it("mentions partner in error message when partnerSupported=true", () => {
      cliUtils.checkRequiredFirmOrPartner({ handle: "my_rec" }, ["handle"], true);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("partner"));
    });

    it("does not mention partner in error message when partnerSupported=false", () => {
      cliUtils.checkRequiredFirmOrPartner({ handle: "my_rec" }, ["handle"], false);
      const errorArg = consola.error.mock.calls[0][0];
      expect(errorArg).not.toContain("partner id");
    });
  });

  // ─── getCommandSettings ───────────────────────────────────────────────────────

  describe("getCommandSettings", () => {
    it("returns type=firm and envId=options.firm when no partner", () => {
      const result = cliUtils.getCommandSettings({ firm: 100 });
      expect(result).toEqual({ type: "firm", envId: 100 });
    });

    it("returns type=partner and envId=options.partner when partner is present", () => {
      const result = cliUtils.getCommandSettings({ partner: "p1" });
      expect(result).toEqual({ type: "partner", envId: "p1" });
    });
  });

  // ─── runCommandChecks ─────────────────────────────────────────────────────────

  describe("runCommandChecks", () => {
    it("calls process.exit when partner used without --message and messageRequired=true", () => {
      cliUtils.runCommandChecks(["handle"], { partner: "p1", handle: "rec", yes: true }, null, true);
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("Message required"));
    });

    it("does not exit for partner with --message when messageRequired=true", () => {
      const result = cliUtils.runCommandChecks(["handle"], { partner: "p1", handle: "rec", message: "msg", yes: true }, null, true);
      expect(processExitSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ type: "partner", envId: "p1" });
    });

    it("calls promptConfirmation when options.yes is falsy and skipConfirmation is false", () => {
      mockPrompt.mockReturnValue("y");
      cliUtils.runCommandChecks(["handle"], { firm: 100, handle: "rec" }, null, false, false);
      expect(mockPrompt).toHaveBeenCalled();
    });

    it("skips promptConfirmation when skipConfirmation=true", () => {
      cliUtils.runCommandChecks(["handle"], { firm: 100, handle: "rec" }, null, false, true);
      expect(mockPrompt).not.toHaveBeenCalled();
    });

    it("skips promptConfirmation when options.yes is truthy", () => {
      cliUtils.runCommandChecks(["handle"], { firm: 100, handle: "rec", yes: true }, null, false, false);
      expect(mockPrompt).not.toHaveBeenCalled();
    });

    it("calls checkDefaultFirm when type is firm", () => {
      cliUtils.runCommandChecks(["handle"], { firm: 100, handle: "rec", yes: true }, 100, false, true);
      expect(consola.info).toHaveBeenCalledWith(expect.stringContaining("100"));
    });

    it("returns the command settings object", () => {
      const result = cliUtils.runCommandChecks(["handle"], { firm: 100, handle: "rec", yes: true }, null, false, true);
      expect(result).toEqual({ type: "firm", envId: 100 });
    });
  });

  // ─── logCurrentHost ───────────────────────────────────────────────────────────

  describe("logCurrentHost", () => {
    it("does not log when host is the default SF host", () => {
      firmCredentials.getHost.mockReturnValue("https://live.getsilverfin.com");
      cliUtils.logCurrentHost();
      expect(consola.info).not.toHaveBeenCalled();
    });

    it("logs current host info when host is a non-default value", () => {
      firmCredentials.getHost.mockReturnValue("https://staging.getsilverfin.com");
      cliUtils.logCurrentHost();
      expect(consola.info).toHaveBeenCalledWith(expect.stringContaining("staging.getsilverfin.com"));
    });
  });

  // ─── checkPartnerSupport ──────────────────────────────────────────────────────

  describe("checkPartnerSupport", () => {
    it("calls process.exit when both --partner and --all are set", () => {
      cliUtils.checkPartnerSupport({ partner: "p1", all: true });
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consola.error).toHaveBeenCalled();
    });

    it("does not exit when only --partner is set", () => {
      cliUtils.checkPartnerSupport({ partner: "p1" });
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("does not exit when only --all is set", () => {
      cliUtils.checkPartnerSupport({ all: true });
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });
});
