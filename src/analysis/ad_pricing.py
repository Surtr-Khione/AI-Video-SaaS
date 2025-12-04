"""
Podcast Advertising Price Estimator and Research Module
"""
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import statistics


class AdPricingAnalyzer:
    """Estimates and researches podcast advertising prices"""

    def __init__(self):
        # Industry standard CPM (Cost Per Mille/Thousand) ranges
        self.cpm_ranges = {
            "micro": (15, 25),        # <10k listeners
            "small": (20, 35),        # 10k-50k listeners
            "medium": (25, 45),       # 50k-250k listeners
            "large": (35, 60),        # 250k-1M listeners
            "mega": (50, 100)         # >1M listeners
        }

        # Ad placement multipliers
        self.placement_multipliers = {
            "pre-roll": 0.7,   # Beginning of episode
            "mid-roll": 1.0,   # Middle of episode (best engagement)
            "post-roll": 0.5   # End of episode
        }

        # Niche engagement multipliers
        self.niche_multipliers = {
            "business": 1.3,
            "technology": 1.25,
            "finance": 1.4,
            "health": 1.2,
            "true crime": 1.1,
            "comedy": 0.9,
            "general": 1.0
        }

    def estimate_pricing(self, podcast_data: Dict, growth_metrics: Dict) -> Dict:
        """
        Estimate advertising pricing for a podcast
        """
        pricing = {
            "estimated_listeners": 0,
            "size_category": "unknown",
            "cpm_range": (0, 0),
            "ad_slots": {},
            "monthly_potential": 0,
            "growth_adjusted_potential": 0,
            "confidence": "low"
        }

        # Estimate listener count
        listeners = self._estimate_listeners(podcast_data)
        pricing["estimated_listeners"] = listeners

        # Categorize podcast size
        size_category = self._categorize_size(listeners)
        pricing["size_category"] = size_category

        # Get base CPM range
        cpm_range = self.cpm_ranges.get(size_category, (20, 40))

        # Apply niche multiplier
        niche = self._detect_niche(podcast_data)
        niche_mult = self.niche_multipliers.get(niche, 1.0)
        cpm_range = (cpm_range[0] * niche_mult, cpm_range[1] * niche_mult)

        pricing["cpm_range"] = (round(cpm_range[0], 2), round(cpm_range[1], 2))
        pricing["detected_niche"] = niche

        # Calculate per-ad-slot pricing
        for placement, multiplier in self.placement_multipliers.items():
            slot_cpm = (cpm_range[0] * multiplier, cpm_range[1] * multiplier)
            price_per_ad = (
                (listeners / 1000) * slot_cpm[0],
                (listeners / 1000) * slot_cpm[1]
            )
            pricing["ad_slots"][placement] = {
                "cpm": (round(slot_cpm[0], 2), round(slot_cpm[1], 2)),
                "price_per_episode": (round(price_per_ad[0], 2), round(price_per_ad[1], 2))
            }

        # Estimate monthly revenue potential
        episodes_per_month = self._estimate_monthly_episodes(podcast_data, growth_metrics)
        mid_roll_price = pricing["ad_slots"]["mid-roll"]["price_per_episode"]

        # Assume 2 mid-roll ads per episode (industry standard)
        monthly_potential = episodes_per_month * statistics.mean(mid_roll_price) * 2
        pricing["monthly_potential"] = round(monthly_potential, 2)
        pricing["episodes_per_month"] = episodes_per_month

        # Adjust for growth (future potential)
        growth_multiplier = self._get_growth_multiplier(growth_metrics)
        pricing["growth_adjusted_potential"] = round(monthly_potential * growth_multiplier, 2)
        pricing["growth_multiplier"] = round(growth_multiplier, 2)

        # Confidence level
        pricing["confidence"] = self._assess_confidence(podcast_data)

        return pricing

    def _estimate_listeners(self, podcast_data: Dict) -> int:
        """Estimate listener count from available metrics"""
        # Try to get explicit listener data
        if "listener_count" in podcast_data:
            return podcast_data["listener_count"]

        # Estimate from other metrics
        episode_count = podcast_data.get("episodeCount", 0)

        # Use ranking/popularity if available
        if "chartRank" in podcast_data or "chart_rank" in podcast_data:
            rank = podcast_data.get("chartRank", podcast_data.get("chart_rank"))
            return self._estimate_from_rank(rank)

        # Use trending score
        if "trendScore" in podcast_data or "trending_score" in podcast_data:
            trend = podcast_data.get("trendScore", podcast_data.get("trending_score", 0))
            # Rough estimation: trend score correlates with listeners
            if trend > 80:
                return 50000
            elif trend > 60:
                return 20000
            elif trend > 40:
                return 8000
            else:
                return 2000

        # Default estimation based on episode count
        if episode_count > 100:
            return 15000
        elif episode_count > 50:
            return 8000
        elif episode_count > 20:
            return 3000
        else:
            return 1000

    def _estimate_from_rank(self, rank: int) -> int:
        """Estimate listeners from chart rank"""
        if rank <= 10:
            return 500000
        elif rank <= 50:
            return 100000
        elif rank <= 100:
            return 50000
        elif rank <= 200:
            return 20000
        else:
            return 5000

    def _categorize_size(self, listeners: int) -> str:
        """Categorize podcast by listener count"""
        if listeners < 10000:
            return "micro"
        elif listeners < 50000:
            return "small"
        elif listeners < 250000:
            return "medium"
        elif listeners < 1000000:
            return "large"
        else:
            return "mega"

    def _detect_niche(self, podcast_data: Dict) -> str:
        """Detect podcast niche from metadata"""
        # Check categories
        categories = podcast_data.get("categories", {})
        if isinstance(categories, dict):
            category_names = [cat.lower() for cat in categories.values()]
        else:
            category_names = [str(cat).lower() for cat in categories] if categories else []

        description = podcast_data.get("description", "").lower()
        title = podcast_data.get("title", "").lower()

        combined_text = " ".join(category_names + [description, title])

        # Simple keyword matching
        if any(word in combined_text for word in ["business", "entrepreneur", "startup", "marketing"]):
            return "business"
        elif any(word in combined_text for word in ["tech", "technology", "software", "coding", "ai"]):
            return "technology"
        elif any(word in combined_text for word in ["finance", "invest", "money", "stock", "crypto"]):
            return "finance"
        elif any(word in combined_text for word in ["health", "fitness", "wellness", "medical"]):
            return "health"
        elif any(word in combined_text for word in ["crime", "murder", "detective", "mystery"]):
            return "true crime"
        elif any(word in combined_text for word in ["comedy", "humor", "funny", "laugh"]):
            return "comedy"
        else:
            return "general"

    def _estimate_monthly_episodes(self, podcast_data: Dict, growth_metrics: Dict) -> float:
        """Estimate number of episodes per month"""
        if "indicators" in growth_metrics and "episode_frequency" in growth_metrics["indicators"]:
            freq = growth_metrics["indicators"]["episode_frequency"]
            avg_days = freq.get("avg_days_between", 14)

            if avg_days > 0:
                return 30 / avg_days

        # Default estimates
        episode_count = podcast_data.get("episodeCount", 0)
        if episode_count < 10:
            return 2
        elif episode_count < 50:
            return 4
        else:
            return 4

    def _get_growth_multiplier(self, growth_metrics: Dict) -> float:
        """Get growth multiplier for future potential"""
        velocity_score = growth_metrics.get("velocity_score", 0)

        if velocity_score >= 75:
            return 2.0  # Explosive growth
        elif velocity_score >= 60:
            return 1.5  # High growth
        elif velocity_score >= 40:
            return 1.2  # Moderate growth
        else:
            return 1.0  # Low/stagnant growth

    def _assess_confidence(self, podcast_data: Dict) -> str:
        """Assess confidence in pricing estimate"""
        has_metrics = 0

        if "listener_count" in podcast_data:
            has_metrics += 3
        if "chartRank" in podcast_data or "chart_rank" in podcast_data:
            has_metrics += 2
        if "trendScore" in podcast_data or "trending_score" in podcast_data:
            has_metrics += 1
        if podcast_data.get("episodeCount", 0) > 10:
            has_metrics += 1

        if has_metrics >= 4:
            return "high"
        elif has_metrics >= 2:
            return "medium"
        else:
            return "low"

    def research_market_rates(self, niche: str) -> Dict:
        """
        Research current market advertising rates for a niche
        Returns benchmark data
        """
        return {
            "niche": niche,
            "average_cpm": self.cpm_ranges.get("medium", (25, 45)),
            "niche_multiplier": self.niche_multipliers.get(niche, 1.0),
            "notes": "Based on industry benchmarks and podcast advertising reports",
            "sources": [
                "Podcast advertising typically ranges $15-100 CPM",
                "Mid-roll ads perform best (1.0x multiplier)",
                "Niche audiences command premium rates"
            ]
        }
