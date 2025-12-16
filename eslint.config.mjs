import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import next from "@next/eslint-plugin-next";

export default [
  // Ignore build artifacts
  {
    ignores: [".next/**", "out/**", "coverage/**"],
  },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript (no type-checking requirement)
  ...tseslint.configs["flat/recommended"],

  // Project defaults
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // React + hooks (JSX runtime — no `React` import needed)
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,

  // Next.js core web vitals
  next.configs["core-web-vitals"],
];
