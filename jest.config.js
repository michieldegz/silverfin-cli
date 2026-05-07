module.exports = {
  setupFiles: ["./tests/setup.js"],
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "lib/**/*.js",
    "index.js",
    "!lib/cli/devMode.js",
    "!lib/cli/autoCompletions.js",
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: { branches: 65, functions: 75, lines: 75, statements: 75 },
  },
};
