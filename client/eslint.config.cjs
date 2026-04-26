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
            ['^\\u0000'],
            ['^..'],
            ['^./'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
];
