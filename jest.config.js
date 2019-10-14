module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  moduleFileExtensions: [ "ts", "tsx", "js", "json" ],
  transform: { "\\.(ts|tsx)$": "ts-jest" },
  testRegex: "\\.test\\.(ts|tsx)$",
  testPathIgnorePatterns: [ '/node_modules/' ]
}
