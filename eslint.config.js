import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'public/mockServiceWorker.js'] },
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
  {
    // Unidirectional module boundaries (bulletproof-react, ADR-0003). The
    // dependency graph flows one way: shared (components / hooks / lib / types /
    // utils / config) -> features -> app. A feature never reaches into a sibling
    // feature or up into app; shared code never reaches up into features or app.
    // Enforced so the architecture is a guarantee, not a convention. The `@/`
    // alias is resolved through the TypeScript resolver below.
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.app.json' },
        node: true,
      },
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            // A feature may import only itself, never a sibling feature.
            {
              target: './src/features/auth',
              from: './src/features',
              except: ['./auth'],
            },
            {
              target: './src/features/cases',
              from: './src/features',
              except: ['./cases'],
            },
            {
              target: './src/features/profile',
              from: './src/features',
              except: ['./profile'],
            },
            {
              target: './src/features/waitlist',
              from: './src/features',
              except: ['./waitlist'],
            },
            // Features may not import the app layer.
            { target: './src/features', from: './src/app' },
            // Shared modules may not import features or the app layer.
            {
              target: [
                './src/components',
                './src/hooks',
                './src/lib',
                './src/types',
                './src/utils',
                './src/config',
              ],
              from: ['./src/features', './src/app'],
            },
          ],
        },
      ],
    },
  },
  {
    // Test utilities re-export their @testing-library surface and are never part
    // of the app's fast-refresh graph, so the component-only-export rule doesn't
    // apply.
    files: ['src/testing/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);
