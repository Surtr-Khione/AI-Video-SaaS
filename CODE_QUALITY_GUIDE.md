# Code Quality & Debugging System Guide

This guide explains how to use the comprehensive code quality and debugging system set up for the AI Video SaaS project.

## Table of Contents

1. [Overview](#overview)
2. [Tools & Technologies](#tools--technologies)
3. [Available Commands](#available-commands)
4. [Automated Checks](#automated-checks)
5. [Configuration Files](#configuration-files)
6. [Debugging Workflows](#debugging-workflows)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

This project includes a complete code quality debugging system that helps maintain high code standards, catch bugs early, and ensure consistent code style across the codebase.

### Key Features

- ✅ **Automated Linting** - ESLint checks for code quality issues
- ✅ **Code Formatting** - Prettier ensures consistent code style
- ✅ **Type Checking** - TypeScript catches type errors
- ✅ **Debug Analysis** - Scans for leftover debug statements
- ✅ **Pre-commit Hooks** - Automatic checks before commits
- ✅ **Pre-push Hooks** - Comprehensive validation before pushing

## Tools & Technologies

### 1. ESLint

**Purpose**: Identifies and reports code quality issues

**Configuration**: `.eslintrc.json`

**Features**:

- TypeScript support
- React/JSX best practices
- Import order enforcement
- Accessibility checks (jsx-a11y)
- Consistent code patterns

### 2. Prettier

**Purpose**: Enforces consistent code formatting

**Configuration**: `.prettierrc.json`

**Features**:

- Automatic code formatting
- Consistent style across the codebase
- Semicolons, quotes, spacing standardized
- 80 character line width

### 3. TypeScript

**Purpose**: Static type checking

**Configuration**: `tsconfig.json`

**Features**:

- Strict type checking
- Unused variable detection
- Import path aliases (@/\*)
- ES2020 target

### 4. Husky + Lint-Staged

**Purpose**: Git hooks for automated quality checks

**Configuration**: `.husky/`, `.lintstagedrc.json`

**Features**:

- Pre-commit: Checks staged files
- Pre-push: Full quality validation

### 5. Debug Analyzer

**Purpose**: Scans for debugging leftovers

**Script**: `scripts/debug-analyzer.js`

**Detects**:

- console.log statements
- debugger statements
- TODO comments
- FIXME comments

## Available Commands

### Quality Check Commands

```bash
# Check code formatting (without fixing)
npm run format:check

# Format all code files
npm run format

# Run ESLint checks (without fixing)
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Run all quality checks (comprehensive)
npm run quality:check

# Auto-fix formatting and linting
npm run quality:fix

# Analyze code for debug statements
npm run debug:analyze
```

### Recommended Workflow

**Before committing**:

```bash
npm run quality:fix
npm run quality:check
```

**To check for debug leftovers**:

```bash
npm run debug:analyze
```

## Automated Checks

### Pre-Commit Hook

Runs automatically when you `git commit`:

1. Checks staged files with ESLint
2. Formats staged files with Prettier
3. Auto-fixes issues when possible
4. Prevents commit if unfixable errors exist

**Bypassing** (not recommended):

```bash
git commit --no-verify
```

### Pre-Push Hook

Runs automatically when you `git push`:

1. Full code formatting check
2. Complete ESLint validation
3. TypeScript type checking
4. Debug statement analysis
5. Prevents push if any check fails

**Bypassing** (not recommended):

```bash
git push --no-verify
```

## Configuration Files

### `.eslintrc.json`

ESLint configuration with:

- TypeScript parser
- React plugin
- Import sorting rules
- Accessibility rules
- Unused variable warnings

### `.prettierrc.json`

Prettier configuration with:

- Single quotes
- Semicolons enabled
- 2-space indentation
- 80 character line width
- Trailing commas (ES5)

### `tsconfig.json`

TypeScript configuration with:

- Strict mode enabled
- ES2020 target
- Path aliases (@/\*)
- Source maps
- Declaration files

### `.lintstagedrc.json`

Lint-staged configuration for pre-commit hooks

### `.eslintignore` / `.prettierignore`

Excluded directories:

- node_modules
- dist/build
- coverage
- .next
- .cache

## Debugging Workflows

### 1. Fixing Formatting Issues

```bash
# Check what's wrong
npm run format:check

# Auto-fix all formatting
npm run format
```

### 2. Fixing Linting Issues

```bash
# See all linting errors
npm run lint

# Auto-fix what can be fixed
npm run lint:fix

# Manually fix remaining issues
```

### 3. Fixing Type Errors

```bash
# Check for type errors
npm run type-check

# Fix errors in your code editor
# No auto-fix available for type errors
```

### 4. Finding Debug Statements

```bash
# Run debug analyzer
npm run debug:analyze

# Review output and remove debug code
```

### 5. Complete Quality Check

```bash
# Run all checks with detailed output
npm run quality:check
```

## Best Practices

### 1. **Commit Frequently**

- Make small, focused commits
- Let pre-commit hooks catch issues early

### 2. **Run Checks Locally**

- Don't rely only on git hooks
- Run `npm run quality:check` before pushing

### 3. **Fix Issues Immediately**

- Don't accumulate quality debt
- Address warnings and errors as they appear

### 4. **Use Auto-Fix**

- Run `npm run quality:fix` first
- Manually fix what can't be auto-fixed

### 5. **Remove Debug Code**

- Don't commit console.log statements
- Remove debugger statements before pushing
- Convert TODOs to issues/tickets

### 6. **Type Safety**

- Use TypeScript types properly
- Avoid `any` type when possible
- Enable strict mode

### 7. **Code Reviews**

- Quality checks don't replace code reviews
- Review logic, architecture, and design
- Use tools to catch mechanical issues

## Troubleshooting

### Issue: Pre-commit hook fails

**Solution**:

```bash
# See what's wrong
git status

# Fix issues
npm run quality:fix

# Check if fixed
npm run quality:check

# Commit again
git commit
```

### Issue: ESLint errors won't auto-fix

**Solution**:

- Read the error message carefully
- Some rules require manual fixes
- Check ESLint documentation for the specific rule

### Issue: TypeScript errors

**Solution**:

- TypeScript errors must be fixed manually
- Check your types and interfaces
- Use your IDE's TypeScript support
- Read error messages for hints

### Issue: Prettier conflicts with ESLint

**Solution**:

- This shouldn't happen with our config
- `eslint-config-prettier` disables conflicting rules
- If it occurs, check configuration files

### Issue: Husky hooks not running

**Solution**:

```bash
# Reinstall husky
npm install

# This runs prepare script
# Or manually:
npx husky install
```

### Issue: Too many errors to fix

**Solution**:

```bash
# Fix what can be auto-fixed
npm run quality:fix

# Fix remaining issues file by file
# Or disable specific rules temporarily (not recommended)
```

## Advanced Usage

### Customizing ESLint Rules

Edit `.eslintrc.json`:

```json
{
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Customizing Prettier

Edit `.prettierrc.json`:

```json
{
  "printWidth": 100,
  "singleQuote": false
}
```

### Disabling Hooks Temporarily

```bash
# Skip pre-commit
git commit --no-verify

# Skip pre-push
git push --no-verify
```

**Warning**: Only use `--no-verify` when absolutely necessary!

### Adding Custom Scripts

Edit `package.json`:

```json
{
  "scripts": {
    "custom-check": "echo 'Add your custom check here'"
  }
}
```

## CI/CD Integration

This system is ready for CI/CD integration. Example GitHub Actions:

```yaml
name: Code Quality
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run quality:check
      - run: npm run debug:analyze
```

## Summary

This code quality system helps you:

- ✅ Write consistent, clean code
- ✅ Catch bugs before they reach production
- ✅ Maintain high code standards
- ✅ Automate repetitive quality checks
- ✅ Focus on building features, not formatting

**Quick Start**:

```bash
# Install dependencies
npm install

# Start coding...

# Before committing
npm run quality:fix
npm run quality:check

# Commit (pre-commit hook runs automatically)
git commit -m "Your message"

# Push (pre-push hook runs automatically)
git push
```

Happy coding! 🚀
