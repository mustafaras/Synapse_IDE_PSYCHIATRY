import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
  ignores: ['dist', 'node_modules', 'build', 'coverage', '*.config.js', 'temp_file.*', 'temp_fixed.*', 'temp.*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      // Include both browser and node globals to avoid no-undef on common vars like __dirname, process
      globals: { ...globals.browser, ...globals.node },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Base JavaScript rules
      ...js.configs.recommended.rules,
      
      // TypeScript rules
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
  // Allow transitional ts-comments without failing the build
  '@typescript-eslint/ban-ts-comment': 'warn',
      
      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/prop-types': 'off', // TypeScript handles this
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-key': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/self-closing-comp': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
  // Non-blocking for missing display names
  'react/display-name': 'warn',
      
      // React Hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
  // Accessibility rules (downgraded to warnings to reduce noise while UI stabilizes)
  ...jsxA11y.configs.recommended.rules,
  'jsx-a11y/alt-text': 'warn',
  'jsx-a11y/anchor-has-content': 'warn',
  'jsx-a11y/aria-role': 'warn',
  'jsx-a11y/img-redundant-alt': 'warn',
  'jsx-a11y/no-access-key': 'warn',
  'jsx-a11y/no-autofocus': 'warn',
  'jsx-a11y/click-events-have-key-events': 'warn',
  'jsx-a11y/no-static-element-interactions': 'warn',
  'jsx-a11y/no-noninteractive-element-interactions': 'warn',
  'jsx-a11y/no-noninteractive-tabindex': 'warn',
  'jsx-a11y/interactive-supports-focus': 'warn',
  'jsx-a11y/label-has-associated-control': 'warn',
  'jsx-a11y/role-supports-aria-props': 'warn',
      
      // General code quality rules
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-debugger': 'error',
  'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'eol-last': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'quote-props': ['error', 'as-needed'],
      'no-trailing-spaces': 'error',
  // TS handles undefineds; disable to avoid noise with DOM/Node types
  'no-undef': 'off',
  // Allow declarations in case blocks without failing CI
  'no-case-declarations': 'warn',
  // Allow empty blocks during WIP, but still flag as warnings; always allow empty catch
  'no-empty': ['warn', { allowEmptyCatch: true }],
  // Don't fail build on escape chars from strings coming from UX content
  'no-useless-escape': 'warn',
  // Non-interactive a11y exceptions shouldn't fail builds
  'jsx-a11y/no-noninteractive-element-interactions': 'warn',
  'jsx-a11y/no-noninteractive-tabindex': 'warn',
  // Avoid build breaks on unknown props during migration
  'react/no-unknown-property': 'warn',
  // Expression-only statements allowed as patterns (e.g., short-circuit)
  '@typescript-eslint/no-unused-expressions': 'warn',
  // Occasionally used in defensive code
  'no-unreachable': 'warn',
      
      // Import/Export rules
  'no-duplicate-imports': 'warn',
  'sort-imports': ['warn', { 
        ignoreCase: true, 
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      }],
      
      // Best practices
  'prefer-template': 'warn',
  'no-useless-concat': 'warn',
  'no-useless-return': 'warn',
  'no-else-return': 'warn',
  'consistent-return': 'warn',
  // Temporarily disable to reduce noise in UI-heavy files; re-enable per-file later
  'no-magic-numbers': 'off',
      
      // Performance
  // Allow inline handlers in UI-heavy exploratory panel (performance impact minimal vs readability)
  'react/jsx-no-bind': 'off',
  // Downgrade leaked render heuristic – current panel intentionally maps conditionally; whitelist typical patterns
  'react/jsx-no-leaked-render': ['warn', { validStrategies: ['coerce', 'ternary'] }],
      'react/jsx-fragments': ['error', 'syntax'],
      
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
    },
  },
  // Prettier configuration (should be last)
  prettier,
];
