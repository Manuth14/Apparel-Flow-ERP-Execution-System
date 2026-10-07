import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",

  testMatch: [
    "<rootDir>/app/tests/**/*.test.ts",
  ],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },

  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
  ],

  clearMocks: true,
};

export default config;
