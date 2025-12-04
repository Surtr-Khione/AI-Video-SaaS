# Testing Guide

Quick reference for testing the Podcast Growth Analyzer.

## Quick Start

### Fastest Way to Test (5 seconds)
```bash
python demo.py
```
Shows working demo with sample data. No setup needed!

---

## All Testing Options

### 1️⃣ Interactive Menu (Recommended)
```bash
./test_interactive.sh
```
Easy menu-driven interface to try everything.

### 2️⃣ Run All Tests
```bash
./run_all_tests.sh
```
Runs complete test suite (takes ~5 seconds).

### 3️⃣ Individual Tests

**Core Functionality:**
```bash
python test_calculations.py
```
- Tests growth analysis
- Tests pricing estimation
- Tests investment scoring
- **Time:** ~1 second

**Edge Cases:**
```bash
python test_edge_cases.py
```
- Tests error handling
- Tests invalid data
- Tests extreme values
- **Time:** ~2 seconds

**Real-World Scenarios:**
```bash
python test_integration.py
```
- Tests 5 realistic podcasts
- Tests various niches
- Tests budget analysis
- **Time:** ~1 second

**Performance:**
```bash
python test_stress.py
```
- Tests 100+ podcasts
- Measures throughput
- Tests memory usage
- **Time:** ~3 seconds

---

## Testing the Main Tool

### Demo Mode (No API Keys)
```bash
python demo.py
```
✅ Works immediately
✅ Shows sample analysis
✅ No setup required

### CLI Tool (Shows Warnings Without APIs)
```bash
python podcast_analyzer.py -n "technology" -b 5000
```
⚠️ Requires API keys for real data
✅ Shows proper error messages

### With API Keys (Full Features)
```bash
# 1. Get free API key from https://podcastindex.org/
# 2. Add to .env file
# 3. Run:
python podcast_analyzer.py -n "artificial intelligence" -b 5000 --detailed
```

---

## What Each Test Does

| Test File | What It Tests | Expected Result |
|-----------|---------------|-----------------|
| `demo.py` | Sample data demo | Shows analysis of 5 podcasts |
| `test_calculations.py` | Core math & logic | All calculations pass |
| `test_edge_cases.py` | Error handling | Handles 9 edge cases |
| `test_integration.py` | Real scenarios | 5 scenarios analyzed |
| `test_stress.py` | Performance | Processes 100+ podcasts |

---

## Expected Output

### ✅ Successful Test Looks Like:
```
============================================================
✅ ALL TESTS PASSED
============================================================
```

### ❌ Failed Test Looks Like:
```
✗ Error: [error message]
```
(If you see this, something's wrong - let us know!)

---

## Verify Installation

Check everything is installed:
```bash
python -c "import requests, pandas, numpy, tabulate; print('✅ All dependencies installed')"
```

Check files exist:
```bash
ls -l *.py | wc -l
```
Should show 7+ Python files.

---

## Common Test Scenarios

### Test 1: Does It Work At All?
```bash
python demo.py
```
**Expected:** Table of podcasts with scores

### Test 2: Are Calculations Accurate?
```bash
python test_calculations.py
```
**Expected:** All tests pass, scores between 0-100

### Test 3: Does It Handle Bad Data?
```bash
python test_edge_cases.py
```
**Expected:** All edge cases handled gracefully

### Test 4: Is It Fast?
```bash
python test_stress.py
```
**Expected:** 5000+ podcasts/second throughput

### Test 5: Can I Use It?
```bash
python podcast_analyzer.py --help
```
**Expected:** Shows usage instructions

---

## Troubleshooting Tests

### "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### "No podcasts found"
- Expected without API keys
- Get free key from https://podcastindex.org/

### "Permission denied"
```bash
chmod +x *.sh
```

### Tests Running Slow
- Normal: 1-5 seconds total
- Stress test may take 3-5 seconds

---

## Advanced Testing

### Test Specific Niche
```python
python -c "
from src.analysis.growth_analyzer import GrowthAnalyzer
analyzer = GrowthAnalyzer()
result = analyzer.calculate_growth_velocity({'title': 'Test', 'trendScore': 80})
print(f'Velocity: {result[\"velocity_score\"]:.1f}')
"
```

### Test Custom Budget
```bash
python podcast_analyzer.py -n "business" -b 10000 -m 50
```

### Benchmark Performance
```bash
time python test_stress.py
```

---

## Test Results Location

All test results documented in:
- `TEST_RESULTS.md` - Complete summary
- Terminal output - Live results
- No files created during tests (read-only)

---

## Quick Checklist

Before using in production:

- [ ] Run `python demo.py` - Works?
- [ ] Run `./run_all_tests.sh` - All pass?
- [ ] Get API keys from podcastindex.org
- [ ] Add keys to `.env` file
- [ ] Run `python podcast_analyzer.py -n "test" -b 5000`
- [ ] Check real data appears

---

## Need Help?

1. Check `README.md` for setup instructions
2. Check `QUICKSTART.md` for usage guide
3. Check `examples/example_output.md` for expected output
4. Run `python podcast_analyzer.py --help`

---

**Last Updated:** 2025-12-04
**Status:** All tests passing ✅
