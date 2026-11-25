module.exports = {
  testEnvironment: 'jsdom',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.tsx?$',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          target: 'es2021',
          esModuleInterop: true,
          skipLibCheck: true,
          strict: false,
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test/style.mock.cjs',
    '.*/config/env$': '<rootDir>/test/env.mock.ts',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!main.tsx',
    '!vite-env.d.ts',
    '!setupTests.ts',
    '!config/env.ts',
    '!test/**',
    '!types/**',
  ],
  coverageDirectory: '../coverage',
};