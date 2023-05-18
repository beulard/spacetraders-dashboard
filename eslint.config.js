module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  rules: {
    semi: "error",
    "prefer-const": "error",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: "module",
  },

  plugins: ["react", "@atlaskit/design-system"],

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@atlaskit/design-system/recommended",
  ],
};
