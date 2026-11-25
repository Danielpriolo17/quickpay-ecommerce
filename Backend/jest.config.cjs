module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  setupFiles: ['reflect-metadata'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          target: 'es2021',
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          esModuleInterop: true,
          skipLibCheck: true,
          strict: false,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@nestjs/common$': '<rootDir>/../test/mocks/nestjs-common.mock.ts',
    '^@nestjs/swagger$': '<rootDir>/../test/mocks/nestjs-swagger.mock.ts',
    '^@nestjs/config$': '<rootDir>/../test/mocks/nestjs-config.mock.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!main.ts',
    '!**/*.module.ts',
    '!**/*.port.ts',
    '!**/*.config.ts',
    '!**/*.dto.ts',
    '!**/prisma.service.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};