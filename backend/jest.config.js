export default {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        'api/**/*.js',
        'usecase/**/*.js',
        'domain/**/*.js',
        'infrastructure/**/*.js',
        '!**/__tests__/**',
        '!**/node_modules/**',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    testTimeout: 30000, // 30 seconds for database operations
    setupFilesAfterEnv: ['./__tests__/setup.js'],
};
