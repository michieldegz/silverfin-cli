jest.mock("consola");
jest.mock("child_process", () => ({
  execFile: jest.fn(),
  execSync: jest.fn(),
}));
jest.mock("fs");

const mockPrompt = jest.fn();
jest.mock("prompt-sync", () => () => mockPrompt);

const fs = require("fs");
const { execFile, execSync } = require("child_process");
const { promisify } = require("util");
const { consola } = require("consola");
const { WSLHandler } = require("../../../lib/utils/wslHandler");

// ─── isWSL ────────────────────────────────────────────────────────────────────

describe("WSLHandler.isWSL", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns true when /proc/version contains 'microsoft'", () => {
    fs.readFileSync.mockReturnValue("Linux version 5.15.0 (Microsoft)");
    expect(WSLHandler.isWSL()).toBe(true);
  });

  it("returns true when /proc/version contains 'wsl'", () => {
    fs.readFileSync.mockReturnValue("Linux version 5.15.0 WSL2");
    expect(WSLHandler.isWSL()).toBe(true);
  });

  it("returns false when /proc/version contains neither", () => {
    fs.readFileSync.mockReturnValue("Linux version 5.15.0 Ubuntu");
    expect(WSLHandler.isWSL()).toBe(false);
  });

  it("returns false when reading /proc/version throws", () => {
    fs.readFileSync.mockImplementation(() => { throw new Error("ENOENT"); });
    expect(WSLHandler.isWSL()).toBe(false);
  });
});

// ─── open ─────────────────────────────────────────────────────────────────────

describe("WSLHandler.open", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: wsl-open is in PATH
    execSync.mockReturnValue(undefined);
  });

  it("calls execFile with wsl-open when it is in PATH", async () => {
    execFile.mockImplementation((_cmd, _args, cb) => cb(null, "", ""));
    await WSLHandler.open("/tmp/file.pdf");
    expect(execFile).toHaveBeenCalledWith("wsl-open", ["/tmp/file.pdf"], expect.any(Function));
  });

  it("calls consola.error when execFile fails", async () => {
    execFile.mockImplementation((_cmd, _args, cb) => cb(new Error("spawn error"), "", ""));
    await WSLHandler.open("/tmp/file.pdf");
    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining("Failed to open file"), expect.any(Error));
  });

  it("prompts for installation when wsl-open is not in PATH and warns when user declines", async () => {
    execSync.mockImplementationOnce(() => { throw new Error("not found"); }); // which wsl-open fails
    mockPrompt.mockReturnValue("n");
    // execFile still called (setup only installs the binary, doesn't gate the call)
    execFile.mockImplementation((_cmd, _args, cb) => cb(null, "", ""));

    await WSLHandler.open("/tmp/file.pdf");

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("Skipping"));
    expect(mockPrompt).toHaveBeenCalled();
  });

  it("installs wsl-open when user confirms with 'y'", async () => {
    execSync
      .mockImplementationOnce(() => { throw new Error("not found"); }) // which fails
      .mockReturnValue(undefined); // sudo npm install succeeds
    mockPrompt.mockReturnValue("y");
    execFile.mockImplementation((_cmd, _args, cb) => cb(null, "", ""));

    await WSLHandler.open("/tmp/file.pdf");

    expect(execSync).toHaveBeenCalledWith("sudo npm install -g wsl-open");
  });
});
