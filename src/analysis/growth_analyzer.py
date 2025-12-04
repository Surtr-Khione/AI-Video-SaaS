"""
Podcast Growth Velocity Analyzer
Analyzes podcast growth trends and identifies high-velocity podcasts
"""
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import statistics


class GrowthAnalyzer:
    """Analyzes podcast growth metrics"""

    def __init__(self):
        self.growth_thresholds = {
            "explosive": 0.5,    # 50%+ growth rate
            "high": 0.25,        # 25-50% growth rate
            "moderate": 0.10,    # 10-25% growth rate
            "slow": 0.05,        # 5-10% growth rate
            "stagnant": 0.0      # <5% growth rate
        }

    def calculate_growth_velocity(self, podcast_data: Dict) -> Dict:
        """
        Calculate growth velocity based on available metrics
        Returns growth rate, velocity score, and trend
        """
        metrics = {
            "growth_rate": 0.0,
            "velocity_score": 0,
            "trend": "unknown",
            "confidence": 0.0,
            "indicators": {}
        }

        # Episode frequency analysis
        episodes = podcast_data.get("episodes", [])
        if episodes:
            episode_metrics = self._analyze_episode_frequency(episodes)
            metrics["indicators"]["episode_frequency"] = episode_metrics

        # Trending score (if available from API)
        if "trendScore" in podcast_data or "trending_score" in podcast_data:
            trend_score = podcast_data.get("trendScore", podcast_data.get("trending_score", 0))
            metrics["indicators"]["trending_score"] = trend_score

        # Episode count growth
        episode_count = podcast_data.get("episodeCount", len(episodes))
        if episode_count:
            metrics["indicators"]["episode_count"] = episode_count
            # More episodes = more established, but look at recent growth

        # Calculate composite velocity score
        velocity_score = self._calculate_composite_score(metrics["indicators"])
        metrics["velocity_score"] = velocity_score
        metrics["trend"] = self._categorize_growth(velocity_score)

        return metrics

    def _analyze_episode_frequency(self, episodes: List[Dict]) -> Dict:
        """Analyze how frequently episodes are published"""
        if not episodes or len(episodes) < 2:
            return {"frequency": "unknown", "consistency": 0, "recent_acceleration": False}

        # Sort episodes by date
        sorted_episodes = sorted(
            [ep for ep in episodes if "datePublished" in ep or "pub_date_ms" in ep],
            key=lambda x: x.get("datePublished", x.get("pub_date_ms", 0)),
            reverse=True
        )

        if len(sorted_episodes) < 2:
            return {"frequency": "unknown", "consistency": 0, "recent_acceleration": False}

        # Calculate gaps between episodes
        gaps = []
        for i in range(min(10, len(sorted_episodes) - 1)):
            curr_date = sorted_episodes[i].get("datePublished", sorted_episodes[i].get("pub_date_ms", 0))
            next_date = sorted_episodes[i + 1].get("datePublished", sorted_episodes[i + 1].get("pub_date_ms", 0))

            if curr_date and next_date:
                gap_days = abs(curr_date - next_date) / (24 * 3600)
                gaps.append(gap_days)

        if not gaps:
            return {"frequency": "unknown", "consistency": 0, "recent_acceleration": False}

        avg_gap = statistics.mean(gaps)
        consistency = 1 / (1 + statistics.stdev(gaps)) if len(gaps) > 1 else 0.5

        # Check if publishing is accelerating (recent gaps shorter)
        recent_acceleration = False
        if len(gaps) >= 4:
            recent_avg = statistics.mean(gaps[:2])
            older_avg = statistics.mean(gaps[2:4])
            recent_acceleration = recent_avg < older_avg * 0.8

        frequency = self._categorize_frequency(avg_gap)

        return {
            "frequency": frequency,
            "avg_days_between": round(avg_gap, 1),
            "consistency": round(consistency, 2),
            "recent_acceleration": recent_acceleration
        }

    def _categorize_frequency(self, avg_gap_days: float) -> str:
        """Categorize publishing frequency"""
        if avg_gap_days <= 3:
            return "multiple_per_week"
        elif avg_gap_days <= 7:
            return "weekly"
        elif avg_gap_days <= 14:
            return "biweekly"
        elif avg_gap_days <= 30:
            return "monthly"
        else:
            return "irregular"

    def _calculate_composite_score(self, indicators: Dict) -> float:
        """Calculate composite growth velocity score (0-100)"""
        score = 0.0
        weights = {
            "episode_frequency": 30,
            "trending_score": 40,
            "episode_count": 30
        }

        # Episode frequency scoring
        if "episode_frequency" in indicators:
            freq_data = indicators["episode_frequency"]
            freq_score = 0

            freq_values = {
                "multiple_per_week": 100,
                "weekly": 80,
                "biweekly": 60,
                "monthly": 40,
                "irregular": 20
            }
            freq_score += freq_values.get(freq_data.get("frequency", "unknown"), 0) * 0.5

            # Consistency bonus
            freq_score += freq_data.get("consistency", 0) * 25

            # Acceleration bonus
            if freq_data.get("recent_acceleration", False):
                freq_score += 25

            score += (freq_score / 100) * weights["episode_frequency"]

        # Trending score
        if "trending_score" in indicators:
            trend_val = min(indicators["trending_score"], 100)
            score += (trend_val / 100) * weights["trending_score"]

        # Episode count (normalized, prefer growing shows)
        if "episode_count" in indicators:
            count = indicators["episode_count"]
            # Sweet spot: 10-100 episodes (established but still growing)
            if 10 <= count <= 100:
                count_score = 100
            elif count < 10:
                count_score = count * 10
            else:
                count_score = max(50, 100 - (count - 100) * 0.5)

            score += (count_score / 100) * weights["episode_count"]

        return min(100, max(0, score))

    def _categorize_growth(self, velocity_score: float) -> str:
        """Categorize growth based on velocity score"""
        if velocity_score >= 75:
            return "explosive"
        elif velocity_score >= 60:
            return "high"
        elif velocity_score >= 40:
            return "moderate"
        elif velocity_score >= 20:
            return "slow"
        else:
            return "stagnant"

    def identify_high_growth_podcasts(self, podcasts: List[Dict],
                                     min_velocity_score: float = 60) -> List[Tuple[Dict, Dict]]:
        """
        Filter and rank podcasts by growth velocity
        Returns list of (podcast, metrics) tuples sorted by velocity score
        """
        results = []

        for podcast in podcasts:
            metrics = self.calculate_growth_velocity(podcast)

            if metrics["velocity_score"] >= min_velocity_score:
                results.append((podcast, metrics))

        # Sort by velocity score (descending)
        results.sort(key=lambda x: x[1]["velocity_score"], reverse=True)

        return results

    def generate_growth_report(self, podcast: Dict, metrics: Dict) -> str:
        """Generate human-readable growth report"""
        report = []
        report.append(f"Podcast: {podcast.get('title', 'Unknown')}")
        report.append(f"Velocity Score: {metrics['velocity_score']:.1f}/100")
        report.append(f"Growth Trend: {metrics['trend'].upper()}")
        report.append("\nIndicators:")

        if "episode_frequency" in metrics["indicators"]:
            freq = metrics["indicators"]["episode_frequency"]
            report.append(f"  - Publishing: {freq['frequency']}")
            report.append(f"  - Consistency: {freq['consistency']:.0%}")
            if freq.get("recent_acceleration"):
                report.append("  - Recent Acceleration: YES ⚡")

        if "episode_count" in metrics["indicators"]:
            report.append(f"  - Total Episodes: {metrics['indicators']['episode_count']}")

        return "\n".join(report)
