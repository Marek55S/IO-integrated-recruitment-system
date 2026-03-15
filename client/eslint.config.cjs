const fs = require('fs');
const path = require('path');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'next-env.d.ts',
      'public/**',
    ],
  },
  {
    // register prettier plugin for flat config
    plugins: {
      prettier: require('eslint-plugin-prettier'),
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // let Prettier handle formatting (including trailing commas)
      'comma-dangle': 'off',
      'prettier/prettier': [
        'error',
        JSON.parse(
          fs.readFileSync(path.join(__dirname, '.prettierrc'), 'utf8'),
        ),
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^react', '^next'],
            ['^@?\\w'],
            ['^\u0000'],
            ['^..'],
            ['^./'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
];
