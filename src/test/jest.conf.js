const tsconfig = require('../../tsconfig.json');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.ts'],
  cacheDirectory: '<rootDir>/build/jest-cache',
  coverageDirectory: '<rootDir>/build/test-results/',
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.html$',
      tsConfig: '<rootDir>/tsconfig.json',
      astTransformers: [require.resolve('jest-preset-angular/InlineHtmlStripStylesTransformer')]
    }
  },
  coveragePathIgnorePatterns: ['<rootDir>/src/test'],
  moduleNameMapper: mapTypescriptAliasToJestAlias(),
  reporters: [
    'default',
    // [ 'jest-junit', { outputDirectory: './build/test-results/', outputName: 'TESTS-results-jest.xml' } ]
    [
      'jest-stare',
      {
        reportTitle: 'PFM UI TESTS',
        reportHeadline: 'PFM UI TESTS',
        resultDir: 'results/jest-stare',
        additionalResultsProcessors: ['jest-html-reporter'],
        coverageLink: '../../build/test-results/lcov-report/index.html',
        jestStareConfigJson: 'jest-stare.json',
        jestGlobalConfigJson: 'globalStuff.json'
      }
    ]
  ],
  testResultsProcessor: 'jest-sonar-reporter',
  transformIgnorePatterns: ['node_modules/'],
  testMatch: ['<rootDir>/src/test/spec/**/@(*.)@(spec.ts)'],
  rootDir: '../../',
  testURL: 'http://localhost/'
};

function mapTypescriptAliasToJestAlias(alias = {}) {
  const jestAliases = { ...alias };
  if (!tsconfig.compilerOptions.paths) {
    return jestAliases;
  }
  Object.entries(tsconfig.compilerOptions.paths)
    .filter(([key, value]) => {
      // use Typescript alias in Jest only if this has value
      if (value.length) {
        return true;
      }
      return false;
    })
    .map(([key, value]) => {
      // if Typescript alias ends with /* then in Jest:
      // - alias key must end with /(.*)
      // - alias value must end with /$1
      const regexToReplace = /(.*)\/\*$/;
      const aliasKey = key.replace(regexToReplace, '$1/(.*)');
      const aliasValue = value[0].replace(regexToReplace, '$1/$$1');
      return [aliasKey, `<rootDir>/${aliasValue}`];
    })
    .reduce((aliases, [key, value]) => {
      aliases[key] = value;
      return aliases;
    }, jestAliases);
  return jestAliases;
}
