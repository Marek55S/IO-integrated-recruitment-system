import { dirname } from "path";
import { fileURLToPath } from "url";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  // 1. Globalne ignorowanie
  {
    ignores: [
      "**/node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "public/**",
    ],
  },

  // 2. Główna konfiguracja
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Włącza formatowanie Prettiera jako regułę ESLint
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: false, // Twoje "double" z konfiguracji
          tabWidth: 2,
          printWidth: 100,
          trailingComma: "es5",
          bracketSpacing: true,
        },
      ],

      // --- Twoje reguły (zgodne z Prettierem) ---
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: "off", // Wyłączamy, bo Prettier lepiej zarządza wcięciami
      "object-curly-spacing": ["error", "always"],
      "no-multi-spaces": "error",
      curly: ["error", "all"],

      // --- Obsługa nieużywanych rzeczy ---
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // --- Specyficzne formatowanie funkcji ---
      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "always",
        },
      ],
    },
  },

  // 3. Wyłączenie reguł ESLint kolidujących z Prettierem (musi być na końcu)
  prettierConfig,
];
