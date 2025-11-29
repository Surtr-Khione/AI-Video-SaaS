#!/bin/bash

# Code Quality Check Script
# This script runs all code quality checks and reports issues

set -e

echo "🔍 Starting Code Quality Checks..."
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track if any checks fail
FAILED=0

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2 passed${NC}"
    else
        echo -e "${RED}✗ $2 failed${NC}"
        FAILED=1
    fi
}

# Check 1: Prettier formatting
echo -e "\n${BLUE}1. Checking code formatting (Prettier)...${NC}"
if npm run format:check; then
    print_status 0 "Format check"
else
    print_status 1 "Format check"
    echo -e "${YELLOW}  → Run 'npm run format' to fix formatting issues${NC}"
fi

# Check 2: ESLint
echo -e "\n${BLUE}2. Checking code linting (ESLint)...${NC}"
if npm run lint; then
    print_status 0 "Lint check"
else
    print_status 1 "Lint check"
    echo -e "${YELLOW}  → Run 'npm run lint:fix' to fix linting issues${NC}"
fi

# Check 3: TypeScript type checking
echo -e "\n${BLUE}3. Checking TypeScript types...${NC}"
if npm run type-check; then
    print_status 0 "Type check"
else
    print_status 1 "Type check"
    echo -e "${YELLOW}  → Fix TypeScript errors manually${NC}"
fi

# Summary
echo -e "\n=================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All quality checks passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some quality checks failed. Please fix the issues above.${NC}"
    exit 1
fi
