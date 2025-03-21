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

// File system helpers
const FileSystem = {
  exists: (filePath) => fs.existsSync(filePath),
  readJson: (filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      log(`❌ Error reading ${filePath}: ${error.message}`, colors.red);
      process.exit(1);
    }
  },
  writeJson: (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  },
  createDirectory: (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};

// Package management helpers
const PackageManager = {
  getInstalledVersion: (packageName, currentDir) => {
    try {
      const pkgPath = path.join(currentDir, 'node_modules', packageName, 'package.json');
      if (FileSystem.exists(pkgPath)) {
        const pkg = FileSystem.readJson(pkgPath);
        return pkg.version;
      }
      return null;
    } catch (error) {
      log(`⚠️ Failed to detect ${packageName} version: ${error.message}`, colors.yellow);
      return null;
    }
  },
  
  detectPackageManager: (currentDir) => {
    return FileSystem.exists(path.join(currentDir, 'yarn.lock')) ? 'yarn add --dev' : 'npm install --save-dev';
  },
  
  installPackage: (packageName, currentDir) => {
    log(`📦 Installing ${packageName} as a dev dependency...`, colors.cyan);
    try {
      const packageManager = PackageManager.detectPackageManager(currentDir);
      execSync(`${packageManager} ${packageName} --legacy-peer-deps`, { stdio: 'inherit' });
      log(`✅ Installed ${packageName}`, colors.green);
      return true;
    } catch (error) {
      log(`⚠️ Failed to install ${packageName}: ${error.message}`, colors.yellow);
      log(`Please install it manually: npm install --save-dev ${packageName} --legacy-peer-deps`, colors.yellow);
      return false;
    }
  }
};

// Dependency detection helpers
const DependencyDetector = {
  hasDependency: (packageJson, dependencyName) => {
    return packageJson.dependencies?.[dependencyName] || packageJson.devDependencies?.[dependencyName];
  },
  
  detectFeatures: (packageJson, currentDir) => {
    const features = {
      react: DependencyDetector.hasDependency(packageJson, 'react'),
      nextJs: DependencyDetector.hasDependency(packageJson, 'next'),
      typescript: FileSystem.exists(path.join(currentDir, 'tsconfig.json')),
      tanstack: DependencyDetector.hasDependency(packageJson, '@tanstack/react-query'),
      tailwind: DependencyDetector.hasDependency(packageJson, 'tailwindcss'),
      prettierTailwind: DependencyDetector.hasDependency(packageJson, 'prettier-plugin-tailwindcss')
    };
    
    // Get Tailwind version if installed
    if (features.tailwind) {
      const version = PackageManager.getInstalledVersion('tailwindcss', currentDir) || '0.0.0';
      features.tailwindVersion = version;
      features.tailwindMajorVersion = parseInt(version.split('.')[0], 10) || 0;
    }
    
    return features;
  },
  
  logDetectedFeatures: (features) => {
    if (!features.react) {
      log('⚠️ React not found in dependencies. best-lint is optimized for React projects.', colors.yellow);
    } else {
      log('✅ React detected', colors.green);
    }

    if (features.nextJs) {
      log('✅ Next.js detected', colors.green);
    } else {
      log('⚠️ Next.js not found. Some rules may not apply.', colors.yellow);
    }
    
    if (features.typescript) {
      log('✅ TypeScript detected. Adding TypeScript rules.', colors.green);
    }
    
    if (features.tanstack) {
      log('✅ TanStack Query detected. Adding TanStack Query rules.', colors.green);
    }
    
    if (features.tailwind) {
      log('✅ Tailwind CSS detected. Adding Tailwind CSS rules.', colors.green);
      if (features.tailwindVersion) {
        log(`📊 Detected Tailwind CSS version ${features.tailwindVersion}`, colors.blue);
      }
    }
  }
};

// Configuration generators
const ConfigGenerator = {
  // Create ESLint configuration
  createEslintConfig: (features, currentDir) => {
    // Get the base config from index.js
    const eslintConfig = JSON.parse(JSON.stringify(baseConfig));
    
    // Check if ESLint is installed
    const packageJson = FileSystem.readJson(path.join(currentDir, 'package.json'));
    const hasEslint = DependencyDetector.hasDependency(packageJson, 'eslint');
    
    if (!hasEslint) {
      log('📦 ESLint not found. Installing eslint as a dev dependency...', colors.cyan);
      PackageManager.installPackage('eslint', currentDir);
    }
    
    // Handle TanStack Query
    if (features.tanstack) {
      const hasTanstackPlugin = DependencyDetector.hasDependency(
        FileSystem.readJson(path.join(currentDir, 'package.json')), 
        '@tanstack/eslint-plugin-query'
      );
      
      if (!hasTanstackPlugin) {
        PackageManager.installPackage('@tanstack/eslint-plugin-query', currentDir);
      }
    }
    
    return eslintConfig;
  },
  
  // Create Prettier configuration
  createPrettierConfig: (features, currentDir) => {
    // Check if prettier is installed
    const packageJson = FileSystem.readJson(path.join(currentDir, 'package.json'));
    const hasPrettier = DependencyDetector.hasDependency(packageJson, 'prettier');
    
    if (!hasPrettier) {
      log('📦 Prettier not found. Installing prettier as a dev dependency...', colors.cyan);
      PackageManager.installPackage('prettier', currentDir);
    }
    
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
    
    // Install Tailwind Prettier plugin if needed
    if (features.tailwind && features.tailwindMajorVersion >= 3) {
      const hasPrettierTailwind = features.prettierTailwind;
      
      if (!hasPrettierTailwind) {
        const installed = PackageManager.installPackage('prettier-plugin-tailwindcss', currentDir);
        features.prettierTailwind = installed;
      }
      
      if (features.prettierTailwind) {
        // Add prettier-plugin-tailwindcss to plugins array
        prettierConfig.plugins = ['prettier-plugin-tailwindcss'];
        
        // Also add it to the baseConfig plugins array
        if (!baseConfig.plugins) {
          baseConfig.plugins = [];
        }
        
        if (!baseConfig.plugins.includes('prettier-plugin-tailwindcss')) {
          baseConfig.plugins.push('prettier-plugin-tailwindcss');
        }
      }
    }
    
    return prettierConfig;
  },

  createPrettierIgnore: (currentDir) => {
    const prettierIgnorePath = path.join(currentDir, '.prettierignore');
    if (!FileSystem.exists(prettierIgnorePath)) {
      FileSystem.writeJson(prettierIgnorePath, ['node_modules', 'dist', 'build']);
    }
  },
  
  // Update package.json scripts
  updatePackageJsonScripts: (packageJson) => {
    if (!packageJson.scripts?.lint) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.lint = 'eslint . --ext .js,.jsx,.ts,.tsx';
      packageJson.scripts.format = 'prettier --write .';
      return true;
    }
    return false;
  }
};

// Main function with orchestration logic
function init() {
  log('🚀 Initializing best-lint configuration...', colors.cyan);

  // Get current directory
  const currentDir = process.cwd();
  
  // Check if package.json exists
  const packageJsonPath = path.join(currentDir, 'package.json');
  if (!FileSystem.exists(packageJsonPath)) {
    log('❌ No package.json found. Please run this command in a Node.js project.', colors.red);
    process.exit(1);
  }

  // Read package.json
  const packageJson = FileSystem.readJson(packageJsonPath);
  
  // Detect features
  const features = DependencyDetector.detectFeatures(packageJson, currentDir);
  DependencyDetector.logDetectedFeatures(features);
  
  // Generate ESLint config
  const eslintConfig = ConfigGenerator.createEslintConfig(features, currentDir);
  const eslintConfigPath = path.join(currentDir, '.eslintrc.json');
  FileSystem.writeJson(eslintConfigPath, eslintConfig);
  log('✅ Created .eslintrc.json configuration', colors.green);
  
  // Generate Prettier config
  const prettierConfig = ConfigGenerator.createPrettierConfig(features, currentDir);
  ConfigGenerator.createPrettierIgnore(currentDir);
  const prettierConfigPath = path.join(currentDir, '.prettierrc.json');
  FileSystem.writeJson(prettierConfigPath, prettierConfig);
  log('✅ Created .prettierrc.json configuration', colors.green);
  
  // Create VS Code settings
  const vscodeDir = path.join(currentDir, '.vscode');
  FileSystem.createDirectory(vscodeDir);
  const vscodeSetting = {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "editor.formatOnSave": true
  };
  const vscodeSettingsPath = path.join(vscodeDir, 'settings.json');
  FileSystem.writeJson(vscodeSettingsPath, vscodeSetting);
  log('✅ Created .vscode/settings.json for convenient IDE setup', colors.green);
  
  // Update package.json scripts if needed
  if (ConfigGenerator.updatePackageJsonScripts(packageJson)) {
    FileSystem.writeJson(packageJsonPath, packageJson);
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