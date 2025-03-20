'use strict';

const hasDep = (dep) => {
  try {
    require.resolve(dep);
    return true;
  } catch (e) {
    return false;
  }
};

const hasTailwind = hasDep('tailwindcss');

const prettierConfig = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};

// Add Tailwind plugin if available
if (hasTailwind && hasDep('prettier-plugin-tailwindcss')) {
  prettierConfig.plugins = ['prettier-plugin-tailwindcss'];
  prettierConfig.tailwindConfig = './tailwind.config.js';
}

module.exports = prettierConfig; 