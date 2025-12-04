#!/bin/bash
# Run all tests

echo "======================================================================"
echo "🧪 RUNNING ALL TESTS"
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

run_test() {
    echo "Running: $1"
    echo "----------------------------------------------------------------------"
    if python "$1"; then
        echo -e "${GREEN}✅ PASSED${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi
    echo ""
}

# Run each test
run_test "test_calculations.py"
run_test "test_edge_cases.py"
run_test "test_integration.py"
run_test "test_stress.py"

echo "======================================================================"
echo "✅ ALL TESTS COMPLETE"
echo "======================================================================"
