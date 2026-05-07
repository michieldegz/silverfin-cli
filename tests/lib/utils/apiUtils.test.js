jest.mock("consola");
jest.mock("../../../lib/api/firmCredentials", () => ({
  firmCredentials: {
    getPartnerCredentials: jest.fn(),
  },
}));

const { consola } = require("consola");
const { firmCredentials } = require("../../../lib/api/firmCredentials");
const apiUtils = require("../../../lib/utils/apiUtils");

describe("apiUtils", () => {
  let processExitSpy;

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    processExitSpy.mockRestore();
  });

  describe("checkRequiredEnvVariables", () => {
    it("does not exit when both SF_API_CLIENT_ID and SF_API_SECRET are set", () => {
      process.env.SF_API_CLIENT_ID = "test_client_id";
      process.env.SF_API_SECRET = "test_client_secret";
      apiUtils.checkRequiredEnvVariables();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("exits with 1 and logs SF_API_CLIENT_ID when it is missing", () => {
      const saved = process.env.SF_API_CLIENT_ID;
      delete process.env.SF_API_CLIENT_ID;
      process.env.SF_API_SECRET = "test_client_secret";
      apiUtils.checkRequiredEnvVariables();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("SF_API_CLIENT_ID"));
      process.env.SF_API_CLIENT_ID = saved;
    });

    it("exits with 1 and logs SF_API_SECRET when it is missing", () => {
      const saved = process.env.SF_API_SECRET;
      delete process.env.SF_API_SECRET;
      process.env.SF_API_CLIENT_ID = "test_client_id";
      apiUtils.checkRequiredEnvVariables();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("SF_API_SECRET"));
      process.env.SF_API_SECRET = saved;
    });

    it("exits with 1 and lists both variables when both are missing", () => {
      const savedId = process.env.SF_API_CLIENT_ID;
      const savedSecret = process.env.SF_API_SECRET;
      delete process.env.SF_API_CLIENT_ID;
      delete process.env.SF_API_SECRET;
      apiUtils.checkRequiredEnvVariables();
      expect(processExitSpy).toHaveBeenCalledWith(1);
      const errorArg = consola.error.mock.calls[0][0];
      expect(errorArg).toContain("SF_API_CLIENT_ID");
      expect(errorArg).toContain("SF_API_SECRET");
      process.env.SF_API_CLIENT_ID = savedId;
      process.env.SF_API_SECRET = savedSecret;
    });
  });

  describe("responseSuccessHandler", () => {
    it("calls consola.debug with status, method and url from response.config", () => {
      const response = {
        status: 200,
        statusText: "OK",
        config: { method: "get", url: "/reconciliations" },
      };
      apiUtils.responseSuccessHandler(response);
      expect(consola.debug).toHaveBeenCalledWith(expect.stringContaining("200"));
      expect(consola.debug).toHaveBeenCalledWith(expect.stringContaining("get"));
      expect(consola.debug).toHaveBeenCalledWith(expect.stringContaining("/reconciliations"));
    });

    it("falls back to response.method and response.url when config is absent", () => {
      const response = {
        status: 201,
        statusText: "Created",
        method: "post",
        url: "/shared_parts",
      };
      apiUtils.responseSuccessHandler(response);
      expect(consola.debug).toHaveBeenCalledWith(expect.stringContaining("201"));
      expect(consola.debug).toHaveBeenCalledWith(expect.stringContaining("post"));
    });

    it("does not call consola.debug when response has no status", () => {
      apiUtils.responseSuccessHandler({});
      expect(consola.debug).not.toHaveBeenCalled();
    });

    it("does not throw when called with null", () => {
      expect(() => apiUtils.responseSuccessHandler(null)).not.toThrow();
    });
  });

  describe("responseErrorHandler", () => {
    const makeError = (status, data = { error: "some error" }) => ({
      response: {
        status,
        statusText: "Error",
        data,
        config: { method: "get", url: "/test" },
      },
    });

    it("always logs the debug line with status, method and url", async () => {
      await apiUtils.responseErrorHandler(makeError(404)).catch(() => {});
      expect(consola.debug).toHaveBeenCalledWith(expect.stringContaining("404"));
    });

    it("calls consola.error and returns undefined for 404", async () => {
      const result = await apiUtils.responseErrorHandler(makeError(404));
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("404"));
      expect(result).toBeUndefined();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("calls consola.error and returns undefined for 400", async () => {
      const result = await apiUtils.responseErrorHandler(makeError(400));
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("400"));
      expect(result).toBeUndefined();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("calls consola.error and process.exit(1) for 422 (falls through to throw since exit is mocked)", async () => {
      // NOTE: 422 handler does not return — it falls through to `throw error`.
      // Since process.exit is mocked in tests, we catch the rethrow.
      await expect(apiUtils.responseErrorHandler(makeError(422, { message: "unprocessable" }))).rejects.toBeDefined();
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("422"), expect.anything(), expect.anything());
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("calls consola.debug for 401 and falls through to throw (no return statement)", async () => {
      // NOTE: 401 handler does not return — it falls through to `throw error`.
      await expect(apiUtils.responseErrorHandler(makeError(401))).rejects.toBeDefined();
      const debugCalls = consola.debug.mock.calls.map((c) => c[0]);
      expect(debugCalls.some((msg) => String(msg).includes("401"))).toBe(true);
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("calls consola.error and process.exit(1) for 403 (falls through to throw since exit is mocked)", async () => {
      // NOTE: 403 handler does not return — it falls through to `throw error`.
      await expect(apiUtils.responseErrorHandler(makeError(403))).rejects.toBeDefined();
      expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("403"));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("rethrows when there is no response property (network error)", async () => {
      const networkError = new Error("Network Error");
      await expect(apiUtils.responseErrorHandler(networkError)).rejects.toThrow("Network Error");
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });

  describe("checkAuthorizePartners", () => {
    it("returns the result of firmCredentials.getPartnerCredentials", () => {
      firmCredentials.getPartnerCredentials.mockReturnValue({ api_key: "partner_key" });
      const result = apiUtils.checkAuthorizePartners("partner_123");
      expect(firmCredentials.getPartnerCredentials).toHaveBeenCalledWith("partner_123");
      expect(result).toEqual({ api_key: "partner_key" });
    });

    it("returns undefined when partner has no credentials", () => {
      firmCredentials.getPartnerCredentials.mockReturnValue(undefined);
      const result = apiUtils.checkAuthorizePartners("unknown_partner");
      expect(result).toBeUndefined();
    });
  });
});
