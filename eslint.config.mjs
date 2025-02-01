import base from "@tilli-pro/eslint-config/base";

export default [
  ...base,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.lint.json",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      // This rule is broken in current version of eslint-config
      "@typescript-eslint/no-unused-expressions": "off"
    },
  },
];
