#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

// Helper to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Main function
function init() {
  log('🚀 Initializing best-lint configuration...', colors.cyan);

  // Get current directory
  const currentDir = process.cwd();
  
  // Check if package.json exists
  const packageJsonPath = path.join(currentDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ No package.json found. Please run this command in a Node.js project.', colors.red);
    process.exit(1);
  }

  // Read package.json
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, colors.red);
    process.exit(1);
  }

  // Check for React and Next.js
  const hasReact = packageJson.dependencies?.react || packageJson.devDependencies?.react;
  const hasNextJs = packageJson.dependencies?.next || packageJson.devDependencies?.next;

  if (!hasReact) {
    log('⚠️ React not found in dependencies. best-lint is optimized for React projects.', colors.yellow);
  } else {
    log('✅ React detected', colors.green);
  }

  if (hasNextJs) {
    log('✅ Next.js detected', colors.green);
  } else {
    log('⚠️ Next.js not found. Some rules may not apply.', colors.yellow);
  }

  // Create ESLint config file
  const eslintConfigPath = path.join(currentDir, '.eslintrc.json');
  const eslintConfig = {
    extends: ['best-lint']
  };

  fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2));
  log('✅ Created .eslintrc.json with best-lint configuration', colors.green);

  // Create Prettier config file
  const prettierConfigPath = path.join(currentDir, '.prettierrc.js');
  const prettierConfig = `module.exports = require('best-lint/prettier');`;

  fs.writeFileSync(prettierConfigPath, prettierConfig);
  log('✅ Created .prettierrc.js with best-lint configuration', colors.green);

  // Add lint script to package.json if it doesn't exist
  if (!packageJson.scripts?.lint) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.lint = 'eslint . --ext .js,.jsx,.ts,.tsx';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('✅ Added lint script to package.json', colors.green);
  }

  // Check for TanStack Query
  const hasTanstack = 
    packageJson.dependencies?.['@tanstack/react-query'] || 
    packageJson.devDependencies?.['@tanstack/react-query'];

  if (hasTanstack) {
    log('✅ TanStack Query detected. Enabling TanStack Query rules.', colors.green);
    
    // Check if the eslint plugin is installed
    const hasTanstackPlugin = 
      packageJson.dependencies?.['@tanstack/eslint-plugin-query'] || 
      packageJson.devDependencies?.['@tanstack/eslint-plugin-query'];
    
    if (!hasTanstackPlugin) {
      log('📦 Installing @tanstack/eslint-plugin-query as a dev dependency...', colors.cyan);
      try {
        const packageManager = fs.existsSync(path.join(currentDir, 'yarn.lock')) ? 'yarn add --dev' : 'npm install --save-dev';
        execSync(`${packageManager} @tanstack/eslint-plugin-query`, { stdio: 'inherit' });
        log('✅ Installed @tanstack/eslint-plugin-query', colors.green);
      } catch (error) {
        log(`⚠️ Failed to install @tanstack/eslint-plugin-query: ${error.message}`, colors.yellow);
        log('Please install it manually: npm install --save-dev @tanstack/eslint-plugin-query', colors.yellow);
      }
    }
  }

  // Check for Tailwind CSS
  const hasTailwind = 
    packageJson.dependencies?.tailwindcss || 
    packageJson.devDependencies?.tailwindcss;

  if (hasTailwind) {
    log('✅ Tailwind CSS detected. Enabling Tailwind CSS rules.', colors.green);
    
    // Check if tailwind plugin is installed
    const hasTailwindPlugin = 
      packageJson.dependencies?.['eslint-plugin-tailwindcss'] || 
      packageJson.devDependencies?.['eslint-plugin-tailwindcss'];
    
    if (!hasTailwindPlugin) {
      log('📦 Installing eslint-plugin-tailwindcss as a dev dependency...', colors.cyan);
      try {
        const packageManager = fs.existsSync(path.join(currentDir, 'yarn.lock')) ? 'yarn add --dev' : 'npm install --save-dev';
        execSync(`${packageManager} eslint-plugin-tailwindcss`, { stdio: 'inherit' });
        log('✅ Installed eslint-plugin-tailwindcss', colors.green);
      } catch (error) {
        log(`⚠️ Failed to install eslint-plugin-tailwindcss: ${error.message}`, colors.yellow);
        log('Please install it manually: npm install --save-dev eslint-plugin-tailwindcss', colors.yellow);
      }
    }
    
    // Check if prettier-plugin-tailwindcss is installed
    const hasPrettierTailwind = 
      packageJson.dependencies?.['prettier-plugin-tailwindcss'] || 
      packageJson.devDependencies?.['prettier-plugin-tailwindcss'];
    
    if (!hasPrettierTailwind) {
      log('📦 Installing prettier-plugin-tailwindcss as a dev dependency...', colors.cyan);
      try {
        const packageManager = fs.existsSync(path.join(currentDir, 'yarn.lock')) ? 'yarn add --dev' : 'npm install --save-dev';
        execSync(`${packageManager} prettier-plugin-tailwindcss`, { stdio: 'inherit' });
        log('✅ Installed prettier-plugin-tailwindcss', colors.green);
      } catch (error) {
        log(`⚠️ Failed to install prettier-plugin-tailwindcss: ${error.message}`, colors.yellow);
        log('Please install it manually: npm install --save-dev prettier-plugin-tailwindcss', colors.yellow);
      }
    }
  }

  log('\n✨ best-lint has been successfully set up!', colors.magenta);
  log('To run ESLint with these rules, execute:', colors.blue);
  log('  npm run lint', colors.cyan);
  log('\nTo fix auto-fixable issues:', colors.blue);
  log('  npm run lint -- --fix', colors.cyan);
}

init(); 