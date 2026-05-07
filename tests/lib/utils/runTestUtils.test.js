const { checkRenderMode } = require("../../../lib/utils/runTestUtils");

describe("checkRenderMode", () => {
  test.each([
    [false, false, "none"],
    [true, false, "input"],
    [false, true, "preview"],
    [true, true, "all"],
  ])("checkRenderMode(%s, %s) → %s", (htmlInput, htmlPreview, expected) => {
    expect(checkRenderMode(htmlInput, htmlPreview)).toBe(expected);
  });
});
