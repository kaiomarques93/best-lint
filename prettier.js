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

const hasTailwind = hasDep('tailwindcss');
const tailwindVersion = hasTailwind ? getTailwindVersion() : '0.0.0';
const tailwindMajorVersion = parseInt(tailwindVersion.split('.')[0], 10) || 0;

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

// Add Tailwind plugin if available and it's version 3+
if (hasTailwind && tailwindMajorVersion >= 3 && hasDep('prettier-plugin-tailwindcss')) {
  prettierConfig.plugins = ['prettier-plugin-tailwindcss'];
  
  // Only add tailwindConfig if the config file exists
  try {
    // Check if tailwind.config.js or tailwind.config.ts exists in project root
    const fs = require('fs');
    const path = require('path');
    
    const possiblePaths = [
      path.join(process.cwd(), 'tailwind.config.js'),
      path.join(process.cwd(), 'tailwind.config.ts'),
      path.join(process.cwd(), 'tailwind.config.mjs')
    ];
    
    const configPath = possiblePaths.find(p => fs.existsSync(p));
    
    if (configPath) {
      const relativePath = path.relative(process.cwd(), configPath);
      prettierConfig.tailwindConfig = './' + relativePath;
    }
  } catch (e) {
    // Silently fail if we can't determine the config file
  }
}

module.exports = prettierConfig; 