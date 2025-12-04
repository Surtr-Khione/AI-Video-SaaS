"""
Investment Scoring Algorithm
Determines if a podcast is a good advertising investment
"""
from typing import Dict, List, Tuple
import statistics


class InvestmentScorer:
    """Scores podcasts for advertising investment potential"""

    def __init__(self):
        # Scoring weights
        self.weights = {
            "growth_velocity": 0.35,     # 35% - How fast it's growing
            "audience_size": 0.20,       # 20% - Current reach
            "cost_efficiency": 0.25,     # 25% - Cost per impression
            "niche_value": 0.10,         # 10% - Industry value
            "consistency": 0.10          # 10% - Publishing consistency
        }

        # Investment recommendation thresholds
        self.thresholds = {
            "strong_buy": 80,
            "buy": 65,
            "hold": 50,
            "avoid": 0
        }

    def calculate_investment_score(self, podcast_data: Dict,
                                   growth_metrics: Dict,
                                   pricing_data: Dict,
                                   budget: float = 5000) -> Dict:
        """
        Calculate comprehensive investment score
        """
        score_breakdown = {}

        # 1. Growth Velocity Score (35%)
        velocity_score = growth_metrics.get("velocity_score", 0)
        growth_score = velocity_score * self.weights["growth_velocity"]
        score_breakdown["growth_velocity"] = {
            "raw_score": velocity_score,
            "weighted_score": round(growth_score, 2),
            "weight": self.weights["growth_velocity"]
        }

        # 2. Audience Size Score (20%)
        audience_score = self._score_audience_size(pricing_data.get("estimated_listeners", 0))
        weighted_audience = audience_score * self.weights["audience_size"]
        score_breakdown["audience_size"] = {
            "raw_score": audience_score,
            "weighted_score": round(weighted_audience, 2),
            "weight": self.weights["audience_size"]
        }

        # 3. Cost Efficiency Score (25%)
        cost_efficiency = self._score_cost_efficiency(pricing_data, budget)
        weighted_efficiency = cost_efficiency * self.weights["cost_efficiency"]
        score_breakdown["cost_efficiency"] = {
            "raw_score": cost_efficiency,
            "weighted_score": round(weighted_efficiency, 2),
            "weight": self.weights["cost_efficiency"]
        }

        # 4. Niche Value Score (10%)
        niche_score = self._score_niche_value(pricing_data.get("detected_niche", "general"))
        weighted_niche = niche_score * self.weights["niche_value"]
        score_breakdown["niche_value"] = {
            "raw_score": niche_score,
            "weighted_score": round(weighted_niche, 2),
            "weight": self.weights["niche_value"]
        }

        # 5. Consistency Score (10%)
        consistency_score = self._score_consistency(growth_metrics)
        weighted_consistency = consistency_score * self.weights["consistency"]
        score_breakdown["consistency"] = {
            "raw_score": consistency_score,
            "weighted_score": round(weighted_consistency, 2),
            "weight": self.weights["consistency"]
        }

        # Calculate total score
        total_score = (growth_score + weighted_audience + weighted_efficiency +
                      weighted_niche + weighted_consistency)

        # Generate recommendation
        recommendation = self._generate_recommendation(total_score)

        # Calculate ROI projection
        roi_projection = self._project_roi(pricing_data, growth_metrics, budget)

        return {
            "total_score": round(total_score, 2),
            "score_breakdown": score_breakdown,
            "recommendation": recommendation,
            "roi_projection": roi_projection,
            "investment_grade": self._get_grade(total_score),
            "key_strengths": self._identify_strengths(score_breakdown),
            "key_concerns": self._identify_concerns(score_breakdown),
            "budget_analysis": self._analyze_budget_fit(pricing_data, budget)
        }

    def _score_audience_size(self, listeners: int) -> float:
        """Score based on audience size (0-100)"""
        # Logarithmic scaling - diminishing returns for very large audiences
        if listeners == 0:
            return 0

        # Sweet spot: 10k-100k listeners (good reach, not oversaturated)
        if 10000 <= listeners <= 100000:
            return 100
        elif listeners < 10000:
            return (listeners / 10000) * 80
        else:
            # Larger audiences score well but not perfect (more expensive)
            return min(100, 80 + (20 * (1 - (listeners - 100000) / 1000000)))

    def _score_cost_efficiency(self, pricing_data: Dict, budget: float) -> float:
        """Score based on cost efficiency (0-100)"""
        cpm_range = pricing_data.get("cpm_range", (0, 0))
        avg_cpm = statistics.mean(cpm_range) if cpm_range[0] > 0 else 40

        monthly_cost = pricing_data.get("monthly_potential", 0)

        # Score based on CPM (lower is better for advertiser)
        cpm_score = 0
        if avg_cpm < 25:
            cpm_score = 100
        elif avg_cpm < 40:
            cpm_score = 80
        elif avg_cpm < 60:
            cpm_score = 60
        elif avg_cpm < 80:
            cpm_score = 40
        else:
            cpm_score = 20

        # Budget fit score
        budget_score = 0
        if monthly_cost == 0:
            budget_score = 50
        elif monthly_cost <= budget * 0.5:
            budget_score = 100  # Well within budget
        elif monthly_cost <= budget:
            budget_score = 80   # Fits budget
        elif monthly_cost <= budget * 1.5:
            budget_score = 50   # Slightly over budget
        else:
            budget_score = 20   # Significantly over budget

        # Weighted combination
        return (cpm_score * 0.6 + budget_score * 0.4)

    def _score_niche_value(self, niche: str) -> float:
        """Score based on advertising value of niche (0-100)"""
        niche_scores = {
            "finance": 100,
            "business": 95,
            "technology": 90,
            "health": 85,
            "true crime": 70,
            "general": 60,
            "comedy": 55
        }
        return niche_scores.get(niche, 60)

    def _score_consistency(self, growth_metrics: Dict) -> float:
        """Score based on publishing consistency (0-100)"""
        if "indicators" not in growth_metrics:
            return 50

        indicators = growth_metrics["indicators"]
        if "episode_frequency" not in indicators:
            return 50

        freq_data = indicators["episode_frequency"]
        consistency = freq_data.get("consistency", 0.5)

        # High consistency is crucial for ongoing campaigns
        return consistency * 100

    def _generate_recommendation(self, score: float) -> str:
        """Generate investment recommendation"""
        if score >= self.thresholds["strong_buy"]:
            return "STRONG BUY"
        elif score >= self.thresholds["buy"]:
            return "BUY"
        elif score >= self.thresholds["hold"]:
            return "CONSIDER"
        else:
            return "AVOID"

    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 80:
            return "A-"
        elif score >= 75:
            return "B+"
        elif score >= 70:
            return "B"
        elif score >= 65:
            return "B-"
        elif score >= 60:
            return "C+"
        elif score >= 55:
            return "C"
        elif score >= 50:
            return "C-"
        else:
            return "D"

    def _project_roi(self, pricing_data: Dict, growth_metrics: Dict, budget: float) -> Dict:
        """Project potential ROI"""
        monthly_cost = pricing_data.get("monthly_potential", 0)
        listeners = pricing_data.get("estimated_listeners", 0)
        growth_mult = pricing_data.get("growth_multiplier", 1.0)

        # Industry average conversion rates
        ctr = 0.02  # 2% click-through rate
        conversion_rate = 0.05  # 5% of clickers convert

        # Calculate potential conversions
        impressions = listeners
        clicks = impressions * ctr
        conversions = clicks * conversion_rate

        # Project 6-month growth
        month_6_listeners = listeners * (growth_mult ** 0.5)  # Conservative growth projection

        return {
            "monthly_impressions": round(impressions),
            "projected_monthly_clicks": round(clicks),
            "projected_monthly_conversions": round(conversions, 1),
            "cost_per_conversion": round(monthly_cost / conversions, 2) if conversions > 0 else 0,
            "6_month_listener_projection": round(month_6_listeners),
            "growth_factor": round(growth_mult, 2),
            "notes": "Based on industry average 2% CTR and 5% conversion rate"
        }

    def _identify_strengths(self, score_breakdown: Dict) -> List[str]:
        """Identify key strengths"""
        strengths = []

        for category, data in score_breakdown.items():
            if data["raw_score"] >= 75:
                category_name = category.replace("_", " ").title()
                strengths.append(f"Strong {category_name} ({data['raw_score']:.0f}/100)")

        return strengths if strengths else ["No major strengths identified"]

    def _identify_concerns(self, score_breakdown: Dict) -> List[str]:
        """Identify key concerns"""
        concerns = []

        for category, data in score_breakdown.items():
            if data["raw_score"] < 40:
                category_name = category.replace("_", " ").title()
                concerns.append(f"Low {category_name} ({data['raw_score']:.0f}/100)")

        return concerns if concerns else ["No major concerns"]

    def _analyze_budget_fit(self, pricing_data: Dict, budget: float) -> Dict:
        """Analyze how well the podcast fits the budget"""
        monthly_cost = pricing_data.get("monthly_potential", 0)

        if monthly_cost == 0:
            return {
                "status": "unknown",
                "affordability": "Unable to determine",
                "recommendation": "Request detailed pricing"
            }

        fit_ratio = monthly_cost / budget if budget > 0 else float('inf')

        if fit_ratio <= 0.5:
            status = "excellent"
            affordability = "Well within budget"
            recommendation = "Room for additional campaigns"
        elif fit_ratio <= 0.8:
            status = "good"
            affordability = "Comfortably within budget"
            recommendation = "Good fit for sustained campaign"
        elif fit_ratio <= 1.0:
            status = "acceptable"
            affordability = "At budget limit"
            recommendation = "Consider full commitment"
        elif fit_ratio <= 1.5:
            status = "stretched"
            affordability = "Above budget"
            recommendation = "Negotiate or increase budget"
        else:
            status = "poor"
            affordability = "Significantly over budget"
            recommendation = "Not feasible with current budget"

        return {
            "status": status,
            "monthly_cost": monthly_cost,
            "budget": budget,
            "utilization": f"{min(100, fit_ratio * 100):.0f}%",
            "affordability": affordability,
            "recommendation": recommendation
        }

    def compare_investments(self, scored_podcasts: List[Tuple[Dict, Dict]]) -> List[Dict]:
        """
        Compare multiple podcast investment opportunities
        Returns sorted list with rankings
        """
        rankings = []

        for podcast, score_data in scored_podcasts:
            rankings.append({
                "podcast_name": podcast.get("title", "Unknown"),
                "total_score": score_data["total_score"],
                "recommendation": score_data["recommendation"],
                "grade": score_data["investment_grade"],
                "monthly_cost": score_data["budget_analysis"]["monthly_cost"],
                "roi_metrics": score_data["roi_projection"]
            })

        # Sort by total score
        rankings.sort(key=lambda x: x["total_score"], reverse=True)

        # Add rankings
        for idx, item in enumerate(rankings, 1):
            item["rank"] = idx

        return rankings
