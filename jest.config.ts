import { JestConfigWithTsJest } from "ts-jest"

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  // All imported modules in your tests should be mocked automatically
  automock: false,

  // Stop running tests after `n` failures
  // bail: 0,

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  testMatch: ["**/__tests__/**/*.spec.ts"],
  moduleDirectories: ["node_modules", __dirname],
  injectGlobals: true,
  testEnvironment: "node",
  setupFiles: ["<rootDir>/src/__tests__/setup/module_mocks.ts"]
}

export default config
