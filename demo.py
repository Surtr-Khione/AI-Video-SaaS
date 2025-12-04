#!/usr/bin/env python3
"""
Demo script showing the Podcast Growth Analyzer in action
Run this to see example outputs without API keys
"""

from src.analysis.growth_analyzer import GrowthAnalyzer
from src.analysis.ad_pricing import AdPricingAnalyzer
from src.scoring.investment_scorer import InvestmentScorer
from tabulate import tabulate


def create_sample_podcast(name, episodes, trend_score, episode_count):
    """Create sample podcast data"""
    return {
        "title": name,
        "author": "Sample Author",
        "description": f"A podcast about {name.lower()}",
        "episodeCount": episode_count,
        "trendScore": trend_score,
        "episodes": [
            {"datePublished": 1700000000 - (i * 86400 * 7)}  # Weekly episodes
            for i in range(episodes)
        ],
        "categories": {"1": "Technology", "2": "Business"}
    }


def main():
    print("\n" + "=" * 80)
    print("🎙️  PODCAST GROWTH ANALYZER - DEMO MODE")
    print("=" * 80)
    print("\nThis demo shows how the analyzer works with sample data.")
    print("Install API keys for real podcast data!\n")
    print("=" * 80)

    # Create sample podcasts
    sample_podcasts = [
        create_sample_podcast("AI Innovators Daily", 25, 85, 120),
        create_sample_podcast("Tech Trends Weekly", 12, 70, 45),
        create_sample_podcast("Future of Robotics", 30, 92, 156),
        create_sample_podcast("Machine Learning Mastery", 15, 65, 78),
        create_sample_podcast("Startup Success Stories", 20, 75, 95),
    ]

    # Initialize analyzers
    growth_analyzer = GrowthAnalyzer()
    pricing_analyzer = AdPricingAnalyzer()
    investment_scorer = InvestmentScorer()

    budget = 5000
    print(f"\n🎯 Analysis Parameters:")
    print(f"   Niche: Technology/AI (Sample Data)")
    print(f"   Budget: ${budget:,.2f}/month")
    print(f"   Min Velocity: 60")
    print("\n" + "=" * 80)

    # Analyze each podcast
    print("\n📊 Analyzing podcasts...")
    results = []

    for podcast in sample_podcasts:
        # Growth analysis
        growth_metrics = growth_analyzer.calculate_growth_velocity(podcast)

        # Pricing analysis
        pricing_data = pricing_analyzer.estimate_pricing(podcast, growth_metrics)

        # Investment scoring
        investment_score = investment_scorer.calculate_investment_score(
            podcast, growth_metrics, pricing_data, budget
        )

        results.append({
            "podcast": podcast,
            "growth": growth_metrics,
            "pricing": pricing_data,
            "score": investment_score
        })

    # Sort by score
    results.sort(key=lambda x: x["score"]["total_score"], reverse=True)

    print("✓ Analysis complete!\n")

    # Display summary table
    print("=" * 80)
    print("📊 TOP INVESTMENT OPPORTUNITIES (SAMPLE DATA)")
    print("=" * 80 + "\n")

    table_data = []
    for idx, item in enumerate(results, 1):
        podcast = item["podcast"]
        score = item["score"]
        pricing = item["pricing"]

        table_data.append([
            idx,
            podcast["title"][:35],
            f"{score['total_score']:.1f}",
            score["investment_grade"],
            score["recommendation"],
            f"${pricing['monthly_potential']:,.0f}",
            f"{pricing['estimated_listeners']:,}"
        ])

    headers = ["#", "Podcast", "Score", "Grade", "Recommendation", "Monthly Cost", "Listeners"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))

    # Show detailed report for top podcast
    print("\n" + "=" * 80)
    print("📝 DETAILED REPORT - TOP PICK")
    print("=" * 80)

    top_pick = results[0]
    podcast = top_pick["podcast"]
    growth = top_pick["growth"]
    pricing = top_pick["pricing"]
    score = top_pick["score"]

    print(f"\n🎙️  {podcast['title']}")
    print(f"   Episodes: {podcast['episodeCount']}")
    print(f"   Author: {podcast['author']}")

    print(f"\n📈 Growth Metrics:")
    print(f"   Velocity Score: {growth['velocity_score']:.1f}/100")
    print(f"   Trend: {growth['trend'].upper()}")
    if "episode_frequency" in growth["indicators"]:
        freq = growth["indicators"]["episode_frequency"]
        print(f"   Frequency: {freq.get('frequency', 'unknown').replace('_', ' ').title()}")
        print(f"   Consistency: {freq.get('consistency', 0):.0%}")

    print(f"\n💰 Pricing:")
    print(f"   Estimated Listeners: {pricing['estimated_listeners']:,}")
    print(f"   CPM Range: ${pricing['cpm_range'][0]:.2f} - ${pricing['cpm_range'][1]:.2f}")
    print(f"   Monthly Potential: ${pricing['monthly_potential']:,.2f}")

    print(f"\n⭐ Investment Score:")
    print(f"   Total Score: {score['total_score']:.1f}/100")
    print(f"   Grade: {score['investment_grade']}")
    print(f"   Recommendation: {score['recommendation']}")

    print(f"\n💡 Budget Analysis:")
    budget_info = score['budget_analysis']
    print(f"   Status: {budget_info['status'].upper()}")
    print(f"   Budget Utilization: {budget_info['utilization']}")
    print(f"   Affordability: {budget_info['affordability']}")

    print(f"\n🎯 ROI Projection:")
    roi = score['roi_projection']
    print(f"   Monthly Impressions: {roi['monthly_impressions']:,}")
    print(f"   Projected Conversions: {roi['projected_monthly_conversions']:.1f}")
    print(f"   Cost per Conversion: ${roi['cost_per_conversion']:.2f}")
    print(f"   6-Month Growth: {roi['6_month_listener_projection']:,} listeners")

    print("\n" + "=" * 80)
    print("\n✅ Demo Complete!")
    print("\n💡 Next Steps:")
    print("   1. Set up API keys in .env file (see .env.example)")
    print("   2. Run: python podcast_analyzer.py -n 'your niche' -b 5000")
    print("   3. Analyze real podcast data!")
    print("\n" + "=" * 80 + "\n")


if __name__ == "__main__":
    main()
