module.exports = {
    plugins: ['jest'],
    env: {
        browser: true,
        es2021: true,
        node: true,
        'jest/globals': true,
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    rules: {},
};
