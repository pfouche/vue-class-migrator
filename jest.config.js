module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    testPathIgnorePatterns: [
      "/__tests__/utils.ts",
      "/__tests__/comp/utils.ts"
    ],
    setupFilesAfterEnv: ["jest-extended/all"]
  };