#!/bin/bash
# Interactive test menu

clear
echo "======================================================================"
echo "🎙️  PODCAST GROWTH ANALYZER - INTERACTIVE TESTER"
echo "======================================================================"
echo ""
echo "What would you like to test?"
echo ""
echo "1) Run demo with sample data (fastest)"
echo "2) Test all automated tests"
echo "3) Test core calculations"
echo "4) Test edge cases"
echo "5) Test real-world scenarios"
echo "6) Test performance (stress test)"
echo "7) Try CLI tool (requires API keys)"
echo "8) Show test results summary"
echo "9) Exit"
echo ""
read -p "Enter choice [1-9]: " choice

case $choice in
    1)
        echo ""
        echo "Running demo mode..."
        python demo.py
        ;;
    2)
        echo ""
        echo "Running all automated tests..."
        ./run_all_tests.sh
        ;;
    3)
        echo ""
        echo "Testing core calculations..."
        python test_calculations.py
        ;;
    4)
        echo ""
        echo "Testing edge cases..."
        python test_edge_cases.py
        ;;
    5)
        echo ""
        echo "Testing real-world scenarios..."
        python test_integration.py
        ;;
    6)
        echo ""
        echo "Running performance tests..."
        python test_stress.py
        ;;
    7)
        echo ""
        echo "Trying CLI tool..."
        echo ""
        read -p "Enter niche (e.g., 'technology', 'business'): " niche
        read -p "Enter budget (e.g., 5000): " budget
        python podcast_analyzer.py -n "$niche" -b "$budget"
        ;;
    8)
        echo ""
        cat TEST_RESULTS.md
        ;;
    9)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice!"
        ;;
esac

echo ""
echo "======================================================================"
echo "Press Enter to continue..."
read
