#!/bin/bash

# Code Quality Auto-Fix Script
# This script attempts to automatically fix code quality issues

set -e

echo "🔧 Auto-fixing Code Quality Issues..."
echo "====================================="

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fix 1: Format code with Prettier
echo -e "\n${BLUE}1. Formatting code with Prettier...${NC}"
npm run format
echo -e "${GREEN}✓ Code formatted${NC}"

# Fix 2: Auto-fix ESLint issues
echo -e "\n${BLUE}2. Auto-fixing ESLint issues...${NC}"
npm run lint:fix
echo -e "${GREEN}✓ ESLint auto-fix complete${NC}"

echo -e "\n====================================="
echo -e "${GREEN}✓ Auto-fix complete!${NC}"
echo -e "\nNote: Some issues may require manual fixing."
echo -e "Run '${BLUE}npm run quality:check${NC}' to verify all fixes."
