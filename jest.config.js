module.exports = {
    verbose:false,
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js"
    },
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest"
    },
    testPathIgnorePatterns: ["/node_modules/", "/public/"]
  }