import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'jest-preset-angular',
  modulePaths: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  resolver: '<rootDir>/jest.resolver.js',
};

export default config;
