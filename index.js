#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Get the current working directory
const cwd = process.cwd();

const eslintConfig = {
  "extends": [
    "next/core-web-vitals", 
    "eslint:recommended", 
    "plugin:prettier/recommended",
    ],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react-hooks/exhaustive-deps": "off",
    "@next/next/no-img-element": "off"
  }
};

const prettierConfig = `{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "semi": false
}`;

const vscodeSettings = `{
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "editor.formatOnSave": true
  }`;

function isNextJsProject() {
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error("This is not a Next.js project (missing package.json).\n");
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.dependencies || !packageJson.dependencies.next) {
    console.error("This project does not seem to be a Next.js project.\n");
    process.exit(1);
  }
}

function writeFile(filename, content) {
  fs.writeFileSync(path.join(cwd, filename), content);
  console.log(`✅ Created ${filename}`);
}

function writeJSONFile(filename, content) {
  fs.writeFileSync(path.join(cwd, filename), JSON.stringify(content, null, 2));
  console.log(`✅ Created ${filename}`);
}

function installPackages(packages) {
  try {
    console.log('📦 Installing required packages...');
    execSync(`npm install --save-dev ${packages.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Packages installed successfully');
  } catch (error) {
    console.error('❌ Error installing packages:', error.message);
    process.exit(1);
  }
}

function main() {
  console.log("🚀 Starting Best Lint...");
  isNextJsProject();

  console.log('📄 Writing .eslintrc.json...');
  writeJSONFile('.eslintrc.json', eslintConfig);

  console.log('📄 Writing .prettierrc...');
  writeFile('.prettierrc', prettierConfig);

  console.log('📄 Writing .prettierignore...');
  fs.writeFileSync(path.join(cwd, '.prettierignore'), 'node_modules\n.next\nbuild');
  console.log('✅ Created .prettierignore');

  console.log('📄 Writing .eslintignore...');
  fs.writeFileSync(path.join(cwd, '.eslintignore'), 'node_modules\n.next\nbuild');
  console.log('✅ Created .eslintignore');

  console.log('📄 Writing .vscode/settings.json...');
  const vscodeSettingsPath = path.join(cwd, '.vscode');
  if (!fs.existsSync(vscodeSettingsPath)) {
    fs.mkdirSync(vscodeSettingsPath);
  }
  writeFile('.vscode/settings.json', vscodeSettings);

  installPackages(['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier']);
  console.log("🎉 Next.js project configured successfully!");
}

main();
