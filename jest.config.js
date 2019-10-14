module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleFileExtensions: [ "ts", "tsx", "js", "json" ],
  transform: { "\\.(ts|tsx)$": "ts-jest" },
  testRegex: "\\.test\\.(ts|tsx)$",
  testPathIgnorePatterns: [ '/node_modules/' ],
  coverageThreshold: {
    global: {
      functions: 75,
      lines: 75,
      statements: 75,
      branches: 75,
    }
  },
  coveragePathIgnorePatterns: [
    'source/modules/index.ts',
    'source/main.ts',
    'source/objectId.scalar.ts',
    'source/types.ts',
    'source/config',
    '/node_modules/'
  ],
}
