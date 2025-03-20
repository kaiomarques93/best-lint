#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const baseConfig = require('./index.js');

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
  
  // Get the base config from index.js
  const eslintConfig = JSON.parse(JSON.stringify(baseConfig));

  // Check for TypeScript
  const hasTypeScript = fs.existsSync(path.join(currentDir, 'tsconfig.json'));
  if (hasTypeScript) {
    log('✅ TypeScript detected. Adding TypeScript rules.', colors.green);
    // TypeScript rules are already included in the baseConfig if it's detected
  }

  // Check for TanStack Query
  const hasTanstack = 
    packageJson.dependencies?.['@tanstack/react-query'] || 
    packageJson.devDependencies?.['@tanstack/react-query'];

  if (hasTanstack) {
    log('✅ TanStack Query detected. Adding TanStack Query rules.', colors.green);
    
    // Check if the eslint plugin is installed
    const hasTanstackPlugin = 
      packageJson.dependencies?.['@tanstack/eslint-plugin-query'] || 
      packageJson.devDependencies?.['@tanstack/eslint-plugin-query'];
    
    if (!hasTanstackPlugin) {
      log('📦 Installing @tanstack/eslint-plugin-query as a dev dependency...', colors.cyan);
      try {
        const packageManager = fs.existsSync(path.join(currentDir, 'yarn.lock')) ? 'yarn add --dev' : 'npm install --save-dev';
        execSync(`${packageManager} @tanstack/eslint-plugin-query --legacy-peer-deps`, { stdio: 'inherit' });
        log('✅ Installed @tanstack/eslint-plugin-query', colors.green);
      } catch (error) {
        log(`⚠️ Failed to install @tanstack/eslint-plugin-query: ${error.message}`, colors.yellow);
        log('Please install it manually: npm install --save-dev @tanstack/eslint-plugin-query --legacy-peer-deps', colors.yellow);
      }
    }
  }

  // Check for Tailwind CSS
  const hasTailwind = 
    packageJson.dependencies?.tailwindcss || 
    packageJson.devDependencies?.tailwindcss;

  if (hasTailwind) {
    log('✅ Tailwind CSS detected. Adding Tailwind CSS rules.', colors.green);
    
    // Check which version of Tailwind is installed
    let tailwindVersion = "";
    try {
      const tailwindPkgPath = path.join(currentDir, 'node_modules', 'tailwindcss', 'package.json');
      if (fs.existsSync(tailwindPkgPath)) {
        const tailwindPkg = JSON.parse(fs.readFileSync(tailwindPkgPath, 'utf8'));
        tailwindVersion = tailwindPkg.version;
        log(`📊 Detected Tailwind CSS version ${tailwindVersion}`, colors.blue);
      }
    } catch (error) {
      log(`⚠️ Failed to detect Tailwind CSS version: ${error.message}`, colors.yellow);
    }
    
    // For Tailwind v3+
    const majorVersion = parseInt(tailwindVersion.split('.')[0], 10);
    if (!isNaN(majorVersion) && majorVersion >= 3) {
      // Tailwind rules are already included in the baseConfig if it's detected
      
      // Check if the tailwind plugin is installed
      const hasTailwindPlugin = 
        packageJson.dependencies?.['eslint-plugin-tailwindcss'] || 
        packageJson.devDependencies?.['eslint-plugin-tailwindcss'];
      
      if (!hasTailwindPlugin) {
        log('📦 Installing eslint-plugin-tailwindcss as a dev dependency...', colors.cyan);
        try {
          const packageManager = fs.existsSync(path.join(currentDir, 'yarn.lock')) ? 'yarn add --dev' : 'npm install --save-dev';
          execSync(`${packageManager} eslint-plugin-tailwindcss --legacy-peer-deps`, { stdio: 'inherit' });
          log('✅ Installed eslint-plugin-tailwindcss', colors.green);
        } catch (error) {
          log(`⚠️ Failed to install eslint-plugin-tailwindcss: ${error.message}`, colors.yellow);
          log('Please install it manually: npm install --save-dev eslint-plugin-tailwindcss --legacy-peer-deps', colors.yellow);
        }
      }
    } else {
      log('⚠️ Tailwind CSS version less than 3.0 detected. Skipping eslint-plugin-tailwindcss.', colors.yellow);
    }
  }

  // Write ESLint config to file
  fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2));
  log('✅ Created .eslintrc.json configuration', colors.green);

  // Create Prettier config file with inline configuration
  const prettierConfigPath = path.join(currentDir, '.prettierrc.json');
  const prettierConfig = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    printWidth: 80,
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf'
  };

  // If Tailwind CSS is detected and it's version 3+
  if (hasTailwind) {
    // Check if prettier plugin is installed
    const hasPrettierTailwind = 
      packageJson.dependencies?.['prettier-plugin-tailwindcss'] || 
      packageJson.devDependencies?.['prettier-plugin-tailwindcss'];
    
    if (!hasPrettierTailwind) {
      log('📦 Installing prettier-plugin-tailwindcss as a dev dependency...', colors.cyan);
      try {
        const packageManager = fs.existsSync(path.join(currentDir, 'yarn.lock')) ? 'yarn add --dev' : 'npm install --save-dev';
        execSync(`${packageManager} prettier-plugin-tailwindcss --legacy-peer-deps`, { stdio: 'inherit' });
        log('✅ Installed prettier-plugin-tailwindcss', colors.green);
      } catch (error) {
        log(`⚠️ Failed to install prettier-plugin-tailwindcss: ${error.message}`, colors.yellow);
        log('Please install it manually: npm install --save-dev prettier-plugin-tailwindcss --legacy-peer-deps', colors.yellow);
      }
    }
  }

  // Write Prettier config to file
  fs.writeFileSync(prettierConfigPath, JSON.stringify(prettierConfig, null, 2));
  log('✅ Created .prettierrc.json configuration', colors.green);

  // Add lint script to package.json if it doesn't exist
  if (!packageJson.scripts?.lint) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.lint = 'eslint . --ext .js,.jsx,.ts,.tsx';
    packageJson.scripts.format = 'prettier --write .';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    log('✅ Added lint and format scripts to package.json', colors.green);
  }

  log('\n✨ best-lint has been successfully set up!', colors.magenta);
  log('To run ESLint with these rules, execute:', colors.blue);
  log('  npm run lint', colors.cyan);
  log('\nTo fix auto-fixable issues:', colors.blue);
  log('  npm run lint -- --fix', colors.cyan);
  log('\nTo format code with Prettier:', colors.blue);
  log('  npm run format', colors.cyan);
}

init(); 