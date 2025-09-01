module.exports = {
    root: true,
    env: {
    browser: true,
    es2021: true,
    },
    parser: '@typescript-eslint/parser',
    extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
    ],
    plugins: ['react-refresh'],
    rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    }