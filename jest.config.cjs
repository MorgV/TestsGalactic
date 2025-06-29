module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./jest.setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: ['**/__tests__/**/*.(ts|tsx|js)', '**/?(*.)+(spec|test).(ts|tsx|js)'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@pages/(.*)$': '<rootDir>/src/pages/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@store/(.*)$': '<rootDir>/src/store/$1',
        '^@styles/(.*)$': '<rootDir>/src/styles/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@ui/(.*)$': '<rootDir>/src/ui/$1',
        '^@constants/(.*)$': '<rootDir>/src/constants/$1',
        '^@app-types/(.*)$': '<rootDir>/src/types/$1',
    },
};
