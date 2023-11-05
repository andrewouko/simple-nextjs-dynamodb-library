import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  testEnvironment: "jest-environment-jsdom",

  coverageReporters: ["clover", "json", "lcov", ["text", { skipFull: true }]],

  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  resolver: '<rootDir>/jest-resolver.js'
};

export default createJestConfig(config);
