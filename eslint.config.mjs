import tsx from "@tilli-pro/eslint-config/tsx-base.mjs";

/**
 * @type {import("eslint").Linter.FlatConfig}
 */
export default [
  ...tsx,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.lint.json",
      },
    },
    rules: {
      
    }
  },
];
