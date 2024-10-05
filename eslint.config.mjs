import tsx from "@tilli-pro/eslint-config/tsx-base.mjs";

export default [
  ...tsx,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.lint.json",
      },
    },
  },
];
