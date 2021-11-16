/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};

export default config;
