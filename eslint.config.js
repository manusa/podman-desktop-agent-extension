import globals from 'globals';
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';

export default [
  {ignores: ['dist/', 'node_modules_windows_x64/']},
  js.configs.recommended,
  {files: ['tests/**', '*.test.js'], ...vitest.configs.recommended},
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  }
];
