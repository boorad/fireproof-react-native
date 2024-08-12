import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  {
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
    },
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // project: './tsconfig.json',
        projectService: true,
      },
    },
    rules: {},
  },
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  // don't lint config files
  {
    ignores: ['*.config.js'],
  },
);
