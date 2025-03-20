'use strict';

const hasDep = (dep) => {
  try {
    require.resolve(dep);
    return true;
  } catch (e) {
    return false;
  }
};

const getTailwindVersion = () => {
  try {
    // Try to find the version number from package.json
    const tailwindPkg = require('tailwindcss/package.json');
    return tailwindPkg.version;
  } catch (e) {
    return '0.0.0'; // Return a default version if not found
  }
};

const hasTanstack = hasDep('@tanstack/eslint-plugin-query');
const hasTypeScript = hasDep('typescript');
const hasTailwind = hasDep('tailwindcss');
const tailwindVersion = hasTailwind ? getTailwindVersion() : '0.0.0';
const tailwindMajorVersion = parseInt(tailwindVersion.split('.')[0], 10) || 0;

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

// Conditionally add Tailwind rules if Tailwind v3+ is installed
if (hasTailwind && tailwindMajorVersion >= 3) {
  baseConfig.extends.push('plugin:tailwindcss/recommended');
  if (hasDep('tailwind-merge')) {
    baseConfig.settings = baseConfig.settings || {};
    baseConfig.settings.tailwindcss = {
      callees: ["twMerge", "cn"]
    };
  }
}

module.exports = baseConfig; 