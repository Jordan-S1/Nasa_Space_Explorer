module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "controllers/**/*.js",
    "routes/**/*.js",
    "middleware/**/*.js",
    "!index.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 10000,
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
  testPathIgnorePatterns: ["/node_modules/"],
};
