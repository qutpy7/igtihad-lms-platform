/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    // Set JWT_SECRET for tests
    setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
    // Increase timeout for integration tests
    testTimeout: 15000,
    // 🔧 Disable TS diagnostics — type checking is done by tsc, not jest
    transform: {
        '^.+\\.ts$': ['ts-jest', { diagnostics: false }],
    },
    // Coverage config
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/routes/**/*.ts',
        'src/middleware/**/*.ts',
        'src/validators/**/*.ts',
        '!src/**/*.d.ts',
    ],
};
