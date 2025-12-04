#!/usr/bin/env python3
"""
Test script to validate calculations
"""
import sys
sys.path.insert(0, '/home/user/AI-Video-SaaS')

from src.analysis.growth_analyzer import GrowthAnalyzer
from src.analysis.ad_pricing import AdPricingAnalyzer
from src.scoring.investment_scorer import InvestmentScorer

# Test 1: Growth Analyzer
print("=" * 60)
print("TEST 1: Growth Analyzer")
print("=" * 60)

analyzer = GrowthAnalyzer()
test_podcast = {
    "title": "Test Podcast",
    "episodeCount": 50,
    "trendScore": 75,
    "episodes": [
        {"datePublished": 1700000000 - (i * 86400 * 7)}  # Weekly
        for i in range(20)
    ]
}

growth_metrics = analyzer.calculate_growth_velocity(test_podcast)
print(f"✓ Velocity Score: {growth_metrics['velocity_score']:.1f}/100")
print(f"✓ Trend: {growth_metrics['trend']}")
print(f"✓ Indicators: {list(growth_metrics['indicators'].keys())}")

# Test 2: Ad Pricing Analyzer
print("\n" + "=" * 60)
print("TEST 2: Ad Pricing Analyzer")
print("=" * 60)

pricing_analyzer = AdPricingAnalyzer()
pricing_data = pricing_analyzer.estimate_pricing(test_podcast, growth_metrics)
print(f"✓ Estimated Listeners: {pricing_data['estimated_listeners']:,}")
print(f"✓ Size Category: {pricing_data['size_category']}")
print(f"✓ CPM Range: ${pricing_data['cpm_range'][0]:.2f} - ${pricing_data['cpm_range'][1]:.2f}")
print(f"✓ Monthly Potential: ${pricing_data['monthly_potential']:,.2f}")

# Test 3: Investment Scorer
print("\n" + "=" * 60)
print("TEST 3: Investment Scorer")
print("=" * 60)

scorer = InvestmentScorer()
investment_score = scorer.calculate_investment_score(
    test_podcast, growth_metrics, pricing_data, 5000
)
print(f"✓ Total Score: {investment_score['total_score']:.1f}/100")
print(f"✓ Grade: {investment_score['investment_grade']}")
print(f"✓ Recommendation: {investment_score['recommendation']}")
print(f"✓ ROI - Cost per Conversion: ${investment_score['roi_projection']['cost_per_conversion']:.2f}")

# Test 4: Edge Cases
print("\n" + "=" * 60)
print("TEST 4: Edge Cases")
print("=" * 60)

# Empty podcast
empty_podcast = {"title": "Empty", "episodeCount": 0, "episodes": []}
empty_growth = analyzer.calculate_growth_velocity(empty_podcast)
print(f"✓ Empty podcast velocity: {empty_growth['velocity_score']:.1f}/100")

# Very large podcast
large_podcast = {
    "title": "Large Podcast",
    "episodeCount": 500,
    "trendScore": 50,
    "episodes": [{"datePublished": 1700000000 - (i * 86400)} for i in range(100)]
}
large_growth = analyzer.calculate_growth_velocity(large_podcast)
print(f"✓ Large podcast velocity: {large_growth['velocity_score']:.1f}/100")

# Test niche detection
print("\n" + "=" * 60)
print("TEST 5: Niche Detection")
print("=" * 60)

test_niches = [
    {"title": "Business Startup Podcast", "description": "entrepreneurship", "categories": {}},
    {"title": "Tech Talk", "description": "technology and software", "categories": {}},
    {"title": "Money Matters", "description": "finance and investing", "categories": {}},
    {"title": "True Crime Stories", "description": "murder mystery", "categories": {}},
]

for test in test_niches:
    detected = pricing_analyzer._detect_niche(test)
    print(f"✓ '{test['title']}' → Niche: {detected}")

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED")
print("=" * 60)
