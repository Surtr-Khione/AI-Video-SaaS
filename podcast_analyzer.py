#!/usr/bin/env python3
"""
Podcast Growth Analyzer - Main CLI Tool
Identifies high-growth podcasts and analyzes advertising investment potential
"""
import os
import sys
import argparse
from dotenv import load_dotenv
from tabulate import tabulate
from typing import List, Dict

# Import our modules
from src.api.podcast_index import PodcastIndexAPI
from src.api.listen_notes import ListenNotesAPI
from src.analysis.growth_analyzer import GrowthAnalyzer
from src.analysis.ad_pricing import AdPricingAnalyzer
from src.scoring.investment_scorer import InvestmentScorer


class PodcastGrowthAnalyzer:
    """Main analyzer class"""

    def __init__(self):
        load_dotenv()

        # Initialize APIs
        self.podcast_index = None
        self.listen_notes = None

        # Try to initialize Podcast Index API
        pi_key = os.getenv("PODCAST_INDEX_API_KEY")
        pi_secret = os.getenv("PODCAST_INDEX_API_SECRET")
        if pi_key and pi_secret:
            self.podcast_index = PodcastIndexAPI(pi_key, pi_secret)
            print("✓ Podcast Index API initialized")

        # Try to initialize Listen Notes API
        ln_key = os.getenv("LISTEN_NOTES_API_KEY")
        if ln_key:
            self.listen_notes = ListenNotesAPI(ln_key)
            print("✓ Listen Notes API initialized")

        if not self.podcast_index and not self.listen_notes:
            print("\n⚠️  Warning: No API keys configured!")
            print("Please set up API keys in .env file (see .env.example)")
            print("The tool will run in demo mode with limited data.\n")

        # Initialize analyzers
        self.growth_analyzer = GrowthAnalyzer()
        self.pricing_analyzer = AdPricingAnalyzer()
        self.investment_scorer = InvestmentScorer()

    def search_niche(self, niche: str, max_results: int = 20) -> List[Dict]:
        """Search for podcasts in a specific niche"""
        print(f"\n🔍 Searching for podcasts in: {niche}")

        podcasts = []

        # Try Podcast Index first
        if self.podcast_index:
            print("  - Searching Podcast Index...")
            results = self.podcast_index.search_by_term(niche, max_results)
            if results:
                # Enhance with episode data
                for podcast in results[:max_results]:
                    feed_id = podcast.get("id")
                    if feed_id:
                        episodes = self.podcast_index.get_episodes_by_feed_id(feed_id, 50)
                        podcast["episodes"] = episodes
                podcasts.extend(results[:max_results])

        # Try Listen Notes if available
        if self.listen_notes and len(podcasts) < max_results:
            print("  - Searching Listen Notes...")
            results = self.listen_notes.search_podcasts(niche, limit=max_results)
            ln_podcasts = results.get("results", [])
            podcasts.extend(ln_podcasts[:max_results - len(podcasts)])

        print(f"✓ Found {len(podcasts)} podcasts\n")
        return podcasts

    def analyze_growth(self, podcasts: List[Dict], min_velocity: float = 60) -> List[tuple]:
        """Analyze growth for podcasts"""
        print(f"📈 Analyzing growth velocity (minimum score: {min_velocity})...")

        high_growth = self.growth_analyzer.identify_high_growth_podcasts(
            podcasts,
            min_velocity_score=min_velocity
        )

        print(f"✓ Identified {len(high_growth)} high-growth podcasts\n")
        return high_growth

    def analyze_pricing(self, podcast: Dict, growth_metrics: Dict) -> Dict:
        """Analyze advertising pricing"""
        return self.pricing_analyzer.estimate_pricing(podcast, growth_metrics)

    def score_investment(self, podcast: Dict, growth_metrics: Dict,
                        pricing_data: Dict, budget: float) -> Dict:
        """Score investment potential"""
        return self.investment_scorer.calculate_investment_score(
            podcast, growth_metrics, pricing_data, budget
        )

    def generate_report(self, podcast: Dict, growth_metrics: Dict,
                       pricing_data: Dict, investment_score: Dict) -> str:
        """Generate comprehensive report"""
        lines = []
        lines.append("\n" + "=" * 80)
        lines.append(f"PODCAST: {podcast.get('title', 'Unknown')}")
        lines.append("=" * 80)

        # Basic Info
        lines.append("\n📊 BASIC INFORMATION")
        lines.append(f"  Author: {podcast.get('author', 'Unknown')}")
        lines.append(f"  Episodes: {podcast.get('episodeCount', 'Unknown')}")
        lines.append(f"  Description: {podcast.get('description', 'N/A')[:150]}...")

        # Growth Metrics
        lines.append("\n📈 GROWTH ANALYSIS")
        lines.append(f"  Velocity Score: {growth_metrics['velocity_score']:.1f}/100")
        lines.append(f"  Growth Trend: {growth_metrics['trend'].upper()}")

        if "episode_frequency" in growth_metrics.get("indicators", {}):
            freq = growth_metrics["indicators"]["episode_frequency"]
            lines.append(f"  Publishing Frequency: {freq.get('frequency', 'unknown').replace('_', ' ').title()}")
            lines.append(f"  Consistency: {freq.get('consistency', 0):.0%}")
            if freq.get("recent_acceleration"):
                lines.append("  Recent Acceleration: YES ⚡")

        # Pricing Analysis
        lines.append("\n💰 ADVERTISING PRICING")
        lines.append(f"  Estimated Listeners: {pricing_data['estimated_listeners']:,}")
        lines.append(f"  Size Category: {pricing_data['size_category'].upper()}")
        lines.append(f"  Detected Niche: {pricing_data.get('detected_niche', 'unknown').title()}")

        cpm_range = pricing_data['cpm_range']
        lines.append(f"  CPM Range: ${cpm_range[0]:.2f} - ${cpm_range[1]:.2f}")

        lines.append("\n  Ad Slot Pricing (per episode):")
        for slot, data in pricing_data['ad_slots'].items():
            price_range = data['price_per_episode']
            lines.append(f"    {slot.title()}: ${price_range[0]:.2f} - ${price_range[1]:.2f}")

        lines.append(f"\n  Monthly Potential: ${pricing_data['monthly_potential']:,.2f}")
        lines.append(f"  Growth-Adjusted (6mo): ${pricing_data['growth_adjusted_potential']:,.2f}")
        lines.append(f"  Confidence: {pricing_data['confidence'].upper()}")

        # Investment Score
        lines.append("\n⭐ INVESTMENT ANALYSIS")
        lines.append(f"  Overall Score: {investment_score['total_score']:.1f}/100")
        lines.append(f"  Grade: {investment_score['investment_grade']}")
        lines.append(f"  Recommendation: {investment_score['recommendation']}")

        lines.append("\n  Score Breakdown:")
        for category, data in investment_score['score_breakdown'].items():
            cat_name = category.replace('_', ' ').title()
            lines.append(f"    {cat_name}: {data['raw_score']:.1f}/100 (weight: {data['weight']:.0%})")

        # ROI Projection
        roi = investment_score['roi_projection']
        lines.append("\n  ROI Projection:")
        lines.append(f"    Monthly Impressions: {roi['monthly_impressions']:,}")
        lines.append(f"    Projected Clicks: {roi['projected_monthly_clicks']:,}")
        lines.append(f"    Projected Conversions: {roi['projected_monthly_conversions']:.1f}")
        lines.append(f"    Cost per Conversion: ${roi['cost_per_conversion']:.2f}")
        lines.append(f"    6-Month Listener Projection: {roi['6_month_listener_projection']:,}")

        # Budget Analysis
        budget_analysis = investment_score['budget_analysis']
        lines.append("\n  Budget Fit:")
        lines.append(f"    Status: {budget_analysis['status'].upper()}")
        lines.append(f"    Monthly Cost: ${budget_analysis['monthly_cost']:,.2f}")
        lines.append(f"    Your Budget: ${budget_analysis['budget']:,.2f}")
        lines.append(f"    Budget Utilization: {budget_analysis['utilization']}")
        lines.append(f"    Recommendation: {budget_analysis['recommendation']}")

        # Strengths & Concerns
        lines.append("\n  Key Strengths:")
        for strength in investment_score['key_strengths']:
            lines.append(f"    ✓ {strength}")

        if investment_score['key_concerns'] != ["No major concerns"]:
            lines.append("\n  Key Concerns:")
            for concern in investment_score['key_concerns']:
                lines.append(f"    ⚠ {concern}")

        lines.append("\n" + "=" * 80)

        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Podcast Growth Analyzer - Find high-growth podcasts for advertising",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Search for AI/tech podcasts with $5000 budget
  python podcast_analyzer.py -n "artificial intelligence" -b 5000

  # Search for business podcasts, minimum 70 velocity score
  python podcast_analyzer.py -n business -b 10000 -m 70

  # Get detailed report on top 5 podcasts
  python podcast_analyzer.py -n marketing -b 3000 --max-results 5 --detailed
        """
    )

    parser.add_argument("-n", "--niche", required=True,
                       help="Niche or industry to search (e.g., 'business', 'tech', 'finance')")
    parser.add_argument("-b", "--budget", type=float, default=5000,
                       help="Monthly advertising budget in USD (default: 5000)")
    parser.add_argument("-m", "--min-velocity", type=float, default=60,
                       help="Minimum growth velocity score 0-100 (default: 60)")
    parser.add_argument("-r", "--max-results", type=int, default=20,
                       help="Maximum number of podcasts to analyze (default: 20)")
    parser.add_argument("-d", "--detailed", action="store_true",
                       help="Show detailed reports for each podcast")
    parser.add_argument("--top", type=int, default=10,
                       help="Number of top results to display (default: 10)")

    args = parser.parse_args()

    print("\n" + "=" * 80)
    print("🎙️  PODCAST GROWTH ANALYZER")
    print("=" * 80)
    print(f"Niche: {args.niche}")
    print(f"Budget: ${args.budget:,.2f}/month")
    print(f"Min Velocity: {args.min_velocity}")
    print("=" * 80)

    # Initialize analyzer
    analyzer = PodcastGrowthAnalyzer()

    # Search for podcasts
    podcasts = analyzer.search_niche(args.niche, args.max_results)

    if not podcasts:
        print("❌ No podcasts found. Try a different search term or check your API keys.")
        sys.exit(1)

    # Analyze growth
    high_growth = analyzer.analyze_growth(podcasts, args.min_velocity)

    if not high_growth:
        print(f"❌ No podcasts found with velocity score >= {args.min_velocity}")
        print("Try lowering the --min-velocity threshold")
        sys.exit(1)

    # Score investments
    print("💯 Scoring investment potential...")
    scored_podcasts = []

    for podcast, growth_metrics in high_growth:
        pricing_data = analyzer.analyze_pricing(podcast, growth_metrics)
        investment_score = analyzer.score_investment(
            podcast, growth_metrics, pricing_data, args.budget
        )

        scored_podcasts.append({
            "podcast": podcast,
            "growth": growth_metrics,
            "pricing": pricing_data,
            "score": investment_score
        })

    # Sort by investment score
    scored_podcasts.sort(key=lambda x: x["score"]["total_score"], reverse=True)

    # Display summary table
    print("\n" + "=" * 80)
    print(f"📊 TOP {min(args.top, len(scored_podcasts))} INVESTMENT OPPORTUNITIES")
    print("=" * 80 + "\n")

    table_data = []
    for idx, item in enumerate(scored_podcasts[:args.top], 1):
        podcast = item["podcast"]
        score = item["score"]
        pricing = item["pricing"]

        table_data.append([
            idx,
            podcast.get("title", "Unknown")[:40],
            f"{score['total_score']:.1f}",
            score["investment_grade"],
            score["recommendation"],
            f"${pricing['monthly_potential']:,.0f}",
            f"{pricing['estimated_listeners']:,}"
        ])

    headers = ["#", "Podcast", "Score", "Grade", "Recommendation", "Monthly Cost", "Listeners"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))

    # Detailed reports if requested
    if args.detailed:
        print("\n" + "=" * 80)
        print("📝 DETAILED REPORTS")
        print("=" * 80)

        for item in scored_podcasts[:args.top]:
            report = analyzer.generate_report(
                item["podcast"],
                item["growth"],
                item["pricing"],
                item["score"]
            )
            print(report)

    print("\n✅ Analysis complete!\n")


if __name__ == "__main__":
    main()
