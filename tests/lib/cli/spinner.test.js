jest.mock("readline", () => ({
  clearLine: jest.fn(),
  cursorTo: jest.fn(),
}));

const readline = require("readline");
const { spinner } = require("../../../lib/cli/spinner");

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  spinner.running = false; // reset state between tests
});

afterEach(() => {
  spinner.stop();
  jest.useRealTimers();
});

describe("Spinner", () => {
  describe("spin", () => {
    it("sets running=true when called", () => {
      const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => {});
      spinner.spin("loading");
      expect(spinner.running).toBe(true);
      writeSpy.mockRestore();
    });

    it("does not start a second interval if already running", () => {
      const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => {});
      spinner.spin("first");
      readline.clearLine.mockClear();
      spinner.spin("second");
      jest.advanceTimersByTime(120);
      // Only one tick's worth of clearLine calls (not two timers running)
      expect(readline.clearLine.mock.calls.length).toBeLessThanOrEqual(1);
      writeSpy.mockRestore();
    });

    it("writes spinner characters to stdout on interval tick", () => {
      const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => {});
      spinner.spin("test text");
      jest.advanceTimersByTime(120);
      const calls = writeSpy.mock.calls.map((c) => String(c[0]));
      expect(calls.some((c) => c.includes("test text"))).toBe(true);
      writeSpy.mockRestore();
    });

    it("calls readline.clearLine and cursorTo on each tick", () => {
      const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => {});
      spinner.spin("loading");
      jest.advanceTimersByTime(120);
      expect(readline.clearLine).toHaveBeenCalled();
      expect(readline.cursorTo).toHaveBeenCalled();
      writeSpy.mockRestore();
    });
  });

  describe("stop", () => {
    it("sets running=false", () => {
      const writeSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => {});
      spinner.spin("loading");
      spinner.stop();
      expect(spinner.running).toBe(false);
      writeSpy.mockRestore();
    });

    it("calls readline.clearLine", () => {
      spinner.stop();
      expect(readline.clearLine).toHaveBeenCalled();
    });
  });
});
