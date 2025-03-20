# best-lint

A universal ESLint and Prettier configuration for React and Next.js projects.

## Features

- 🚀 Zero-config setup for ESLint and Prettier
- ⚛️ Optimized for React and Next.js
- 🔄 Optional TanStack Query support
- 🎨 Tailwind CSS integration
- 🧩 TypeScript support
- 📦 Consistent import sorting rules
- 🛠️ Simple CLI for installation

## Installation

```bash
# Using npm
npm install --save-dev best-lint

# Using yarn
yarn add --dev best-lint

# Using pnpm
pnpm add --save-dev best-lint
```

## Quick Setup

After installing the package, you can run the CLI to set up everything automatically:

```bash
npx best-lint
```

This will:
1. Create `.eslintrc.json` with best-lint configuration
2. Create `.prettierrc.js` with best-lint configuration
3. Detect TanStack Query and install related plugins if needed
4. Detect Tailwind CSS and install related plugins if needed
5. Add a lint script to your package.json if it doesn't exist

## Manual Setup

### ESLint Configuration

Create `.eslintrc.json` in your project root:

```json
{
  "extends": ["best-lint"]
}
```

### Prettier Configuration

Create `.prettierrc.js` in your project root:

```js
module.exports = require('best-lint/prettier');
```

## Features

### Core Rules

- Extends Next.js core web vitals
- Prettier integration
- Import sorting and validation
- Unused imports detection

### TypeScript Support

TypeScript support is automatically enabled if TypeScript is detected in your project.

### TanStack Query Support

TanStack Query rules are automatically enabled if @tanstack/react-query is detected in your project.

### Tailwind CSS Support

Tailwind CSS rules are automatically enabled if tailwindcss is detected in your project.

## All included plugins and configurations

- eslint-config-next
- eslint-config-prettier
- eslint-plugin-prettier
- eslint-plugin-import
- eslint-plugin-unused-imports
- eslint-plugin-simple-import-sort
- eslint-plugin-tailwindcss (optional)
- @typescript-eslint/eslint-plugin (optional)
- @tanstack/eslint-plugin-query (optional)
- prettier-plugin-tailwindcss (optional)

## License

MIT 