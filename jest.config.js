/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "@aws-sdk/client-s3": "<rootDir>/__mocks__/s3-mock.ts",
  },
};

export default config;
