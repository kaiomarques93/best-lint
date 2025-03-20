'use strict';

const hasDep = (dep) => {
  try {
    require.resolve(dep);
    return true;
  } catch (e) {
    return false;
  }
};

const hasTanstack = hasDep('@tanstack/eslint-plugin-query');
const hasTypeScript = hasDep('typescript');
const hasTailwind = hasDep('tailwindcss');

const baseConfig = {
  extends: [
    'next/core-web-vitals',
    'plugin:prettier/recommended',
  ],
  plugins: [
    'unused-imports',
    'import',
    'simple-import-sort',
  ],
  rules: {
    // Base rules
    'unused-imports/no-unused-imports': 'warn',
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-mutable-exports': 'error',
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ],
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    '@next/next/no-img-element': 'off',
  },
  ignorePatterns: [
    '.next/',
    'out/',
    'node_modules/',
    'public/',
    'dist/',
    'build/'
  ]
};

// Conditionally add TypeScript rules if TypeScript is installed
if (hasTypeScript) {
  baseConfig.extends.push('plugin:@typescript-eslint/recommended');
  baseConfig.plugins.push('@typescript-eslint');
  baseConfig.rules['@typescript-eslint/no-unused-vars'] = [
    'warn',
    { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }
  ];
}

// Conditionally add TanStack Query rules if the plugin is installed
if (hasTanstack) {
  baseConfig.extends.push('plugin:@tanstack/eslint-plugin-query/recommended');
  baseConfig.plugins.push('@tanstack/query');
  baseConfig.rules['@tanstack/query/exhaustive-deps'] = 'error';
  baseConfig.rules['@tanstack/query/no-rest-destructuring'] = 'warn';
  baseConfig.rules['@tanstack/query/stable-query-client'] = 'error';
}

// Conditionally add Tailwind rules if Tailwind is installed
if (hasTailwind) {
  baseConfig.extends.push('plugin:tailwindcss/recommended');
  if (hasDep('tailwind-merge')) {
    baseConfig.settings = baseConfig.settings || {};
    baseConfig.settings.tailwindcss = {
      callees: ["twMerge", "cn"]
    };
  }
}

module.exports = baseConfig; 