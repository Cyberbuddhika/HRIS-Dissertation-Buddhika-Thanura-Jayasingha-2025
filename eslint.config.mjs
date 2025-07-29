import globals from "globals";
import pluginJs from "@eslint/js";
import tailwindPlugin from "eslint-plugin-tailwindcss";

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      tailwindcss: tailwindPlugin,
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off", // Turn this off if you're using custom classes
      "stylelint/no-duplicate-selectors": null,
    },
  },
  {
    extends: [
      "eslint:recommended",
      "plugin:tailwindcss/recommended",
      "prettier",
    ],
  },
];
