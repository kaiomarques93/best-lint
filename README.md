# Best Lint

The **Best Lint** is a CLI tool to quickly set up ESLint, Prettier, and optional TanStack Query configurations in newly created Next.js projects.

## Features
- **ESLint**: Sets up `.eslintrc.json` with recommended configurations for Next.js, Prettier, and additional rules.
- **Prettier**: Sets up `.prettierrc` and `.prettierignore` for code formatting.
- **VS Code Integration**: Creates `.vscode/settings.json` to automatically format files on save and apply ESLint fixes.
- **TanStack Query Integration**: Optionally installs and configures TanStack Query with recommended ESLint rules.

## Installation

1. Clone this repository or download the script file.
2. Ensure you have Node.js installed.
3. Make the script executable (optional):
   ```bash
   chmod +x best-lint.js
   ```

## Usage

Run the script in the root of your Next.js project:

```bash
npx best-lint
```

The script will:
1. Verify that you are inside a Next.js project.
2. Prompt you to decide whether to install **TanStack Query**.
3. Configure and create the following files:
   - `.eslintrc.json`
   - `.prettierrc`
   - `.prettierignore`
   - `.eslintignore`
   - `.vscode/settings.json`
4. Install required dependencies via npm.

## File Details

### .eslintrc.json
```json
{
  "extends": [
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```
If **TanStack Query** is enabled, the following will be added to the configuration:
- **Extends**: `plugin:@tanstack/eslint-plugin-query/recommended`
- **Plugins**: `@tanstack/query`
- **Rules**: 
  ```json
  "@tanstack/query/exhaustive-deps": "error",
  "@tanstack/query/no-rest-destructuring": "warn",
  "@tanstack/query/stable-query-client": "error"
  ```

### .prettierrc
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "semi": false
}
```

### .prettierignore
```
node_modules
.next
build
```

### .eslintignore
```
node_modules
.next
build
```

### .vscode/settings.json
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true
}
```

## Dependencies

The following packages are installed automatically:
- **ESLint**: `eslint`, `eslint-config-prettier`, `eslint-plugin-prettier`
- **Prettier**: `prettier`
- **TanStack Query** (if enabled): 
  - Dev dependencies: `@tanstack/eslint-plugin-query`, `@tanstack/react-query-devtools`
  - Production dependency: `@tanstack/react-query`

## Customization
You can customize the rules in `.eslintrc.json`, `.prettierrc`, or any other files as needed.

## Troubleshooting
If you encounter any issues during the package installation, check your internet connection or try running the command again. If errors persist, consider removing the `node_modules` and `package-lock.json` files and running `npm install`.

## Contributing
Feel free to open issues and submit pull requests to improve this configurator. Contributions are welcome!

## License
This project is open-source and available under the [MIT License](LICENSE).