#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

// Get the current working directory
const cwd = process.cwd();

const eslintConfig = {
  "extends": [
    "next/core-web-vitals", 
    "eslint:recommended", 
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended"
    ],
    "plugins": ["unused-imports", "import"],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react-hooks/exhaustive-deps": "off",
    "@next/next/no-img-element": "off",
    "unused-imports/no-unused-imports": "warn",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
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
      "source.fixAll.eslint": "explicit"
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

function askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    return new Promise(resolve => rl.question(query, answer => {
      rl.close();
      resolve(answer);
    }));
  }

async function main() {
    console.log("🚀 Starting Best Lint...");
    isNextJsProject();
  
    const useTanStack = await askQuestion("Would you like to install TanStack Query? (yes/no): ");
    const useTailwind = await askQuestion("Would you like to install Eslint for Tailwind CSS? (yes/no): ");

    console.log('📄 Writing .eslintrc.json...');
    if (useTanStack.toLowerCase() === 'yes') {
      eslintConfig.extends.push("plugin:@tanstack/eslint-plugin-query/recommended");
      eslintConfig.plugins.push("@tanstack/query");
      eslintConfig.rules["@tanstack/query/exhaustive-deps"] = "error";
      eslintConfig.rules["@tanstack/query/no-rest-destructuring"] = "warn";
      eslintConfig.rules["@tanstack/query/stable-query-client"] = "error";
    }

    if (useTailwind.toLowerCase() === 'yes') {
        console.log('📦 Installing Tailwind eslint packages...');
        eslintConfig.extends.push("plugin:tailwindcss/recommended");
        installPackages(['prettier-plugin-tailwindcss', 'eslint-plugin-tailwindcss']);
        try {
          execSync('npm install @tanstack/react-query', { stdio: 'inherit' });
          console.log('✅ Installed @tanstack/react-query successfully');
        } catch (error) {
          console.error('❌ Error installing @tanstack/react-query:', error.message);
        }
      }
    
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
  
    installPackages([
        'eslint@^8', 
        'prettier', 
        'eslint-config-prettier', 
        'eslint-plugin-prettier', 
        '@typescript-eslint/eslint-plugin@^8.16.0',
        '@typescript-eslint/parser@^8.16.0',
        'eslint-plugin-unused-imports@^4.1.3',
        "eslint-plugin-import@^2.29.1"
    ]);
  
    if (useTanStack.toLowerCase() === 'yes') {
      console.log('📦 Installing TanStack Query packages...');
      installPackages(['@tanstack/eslint-plugin-query', '@tanstack/react-query-devtools']);
      try {
        execSync('npm install @tanstack/react-query', { stdio: 'inherit' });
        console.log('✅ Installed @tanstack/react-query successfully');
      } catch (error) {
        console.error('❌ Error installing @tanstack/react-query:', error.message);
      }
    }
  
    console.log("🎉 Next.js project configured successfully!");
  }
  
main();
