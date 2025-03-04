import globals from 'globals';
import js from '@eslint/js';

export default [
  {ignores: ['dist/', 'node_modules_unix_arm64/', 'node_modules_windows_x64/']},
  js.configs.recommended,
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
