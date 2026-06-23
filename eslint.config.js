import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': ['warn'],
    },
  },
  {
    // Cache keys live in one collision-checkable index (ADR-0001); call sites
    // must reference queryKeys, not spell raw arrays. Tests may mock with
    // literal keys, so they are exempt.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Property[key.name='queryKey'] > ArrayExpression",
          message:
            'Use a key from queryKeys (src/lib/query-keys.ts), not a raw queryKey array literal — keeps cache keys in one collision-checkable index (ADR-0001).',
        },
      ],
    },
  },
);
