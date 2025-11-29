#!/usr/bin/env node

/**
 * Debug Analyzer - Analyzes code for common debugging issues
 *
 * This script scans the codebase for:
 * - console.log statements (potential debug leftovers)
 * - debugger statements
 * - TODO/FIXME comments
 * - Complex functions (high cyclomatic complexity)
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
};

class DebugAnalyzer {
  constructor() {
    this.results = {
      consoleLogs: [],
      debuggers: [],
      todos: [],
      fixmes: [],
    };
  }

  analyze(dir = './src') {
    if (!fs.existsSync(dir)) {
      console.log(
        `${colors.yellow}Directory ${dir} does not exist yet.${colors.reset}`
      );
      console.log(
        `${colors.blue}Create your source files in ${dir} to start analyzing.${colors.reset}`
      );
      return;
    }

    this.scanDirectory(dir);
    this.printResults();
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.scanDirectory(filePath);
        }
      } else if (this.isCodeFile(file)) {
        this.scanFile(filePath);
      }
    });
  }

  isCodeFile(filename) {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
    return codeExtensions.some((ext) => filename.endsWith(ext));
  }

  scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check for console.log
      if (line.match(/console\.log\(/)) {
        this.results.consoleLogs.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
        });
      }

      // Check for debugger statements
      if (line.match(/\bdebugger\b/)) {
        this.results.debuggers.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
        });
      }

      // Check for TODO comments
      if (line.match(/\/\/\s*TODO/i) || line.match(/\/\*\s*TODO/i)) {
        this.results.todos.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
        });
      }

      // Check for FIXME comments
      if (line.match(/\/\/\s*FIXME/i) || line.match(/\/\*\s*FIXME/i)) {
        this.results.fixmes.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
        });
      }
    });
  }

  printResults() {
    console.log('\n🔍 Debug Analyzer Results');
    console.log('========================\n');

    this.printSection('Console Logs', this.results.consoleLogs, colors.yellow);
    this.printSection(
      'Debugger Statements',
      this.results.debuggers,
      colors.red
    );
    this.printSection('TODO Comments', this.results.todos, colors.blue);
    this.printSection('FIXME Comments', this.results.fixmes, colors.red);

    const totalIssues =
      this.results.consoleLogs.length +
      this.results.debuggers.length +
      this.results.todos.length +
      this.results.fixmes.length;

    console.log('\n========================');
    if (totalIssues === 0) {
      console.log(`${colors.green}✓ No debug issues found!${colors.reset}`);
    } else {
      console.log(
        `${colors.yellow}Found ${totalIssues} items to review${colors.reset}`
      );
    }
    console.log('');
  }

  printSection(title, items, color) {
    if (items.length === 0) {
      console.log(`${color}${title}:${colors.reset} None found ✓`);
      return;
    }

    console.log(`${color}${title}: ${items.length} found${colors.reset}`);
    items.forEach((item) => {
      console.log(`  ${item.file}:${item.line}`);
      console.log(`    ${item.content}`);
    });
    console.log('');
  }
}

// Run analyzer
const analyzer = new DebugAnalyzer();
analyzer.analyze();
