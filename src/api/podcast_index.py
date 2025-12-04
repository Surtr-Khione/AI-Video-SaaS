"""
Podcast Index API Integration
https://podcastindex.org/
"""
import hashlib
import time
import requests
from typing import Dict, List, Optional


class PodcastIndexAPI:
    """Interface for Podcast Index API"""

    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.podcastindex.org/api/1.0"

    def _get_headers(self) -> Dict[str, str]:
        """Generate authentication headers"""
        epoch_time = int(time.time())
        data_to_hash = self.api_key + self.api_secret + str(epoch_time)
        sha1_hash = hashlib.sha1(data_to_hash.encode()).hexdigest()

        return {
            "X-Auth-Date": str(epoch_time),
            "X-Auth-Key": self.api_key,
            "Authorization": sha1_hash,
            "User-Agent": "PodcastGrowthAnalyzer/1.0"
        }

    def search_by_term(self, term: str, max_results: int = 50) -> List[Dict]:
        """Search podcasts by term/niche"""
        url = f"{self.base_url}/search/byterm"
        params = {"q": term, "max": max_results, "clean": ""}

        try:
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("feeds", [])
        except Exception as e:
            print(f"Error searching podcasts: {e}")
            return []

    def get_podcast_by_feed_id(self, feed_id: int) -> Optional[Dict]:
        """Get detailed podcast information"""
        url = f"{self.base_url}/podcasts/byfeedid"
        params = {"id": feed_id}

        try:
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("feed")
        except Exception as e:
            print(f"Error getting podcast details: {e}")
            return None

    def get_trending_podcasts(self, max_results: int = 50, category: Optional[str] = None) -> List[Dict]:
        """Get trending podcasts"""
        url = f"{self.base_url}/podcasts/trending"
        params = {"max": max_results, "lang": "en"}

        if category:
            params["cat"] = category

        try:
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("feeds", [])
        except Exception as e:
            print(f"Error getting trending podcasts: {e}")
            return []

    def get_episodes_by_feed_id(self, feed_id: int, max_results: int = 100) -> List[Dict]:
        """Get recent episodes for growth analysis"""
        url = f"{self.base_url}/episodes/byfeedid"
        params = {"id": feed_id, "max": max_results}

        try:
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("items", [])
        except Exception as e:
            print(f"Error getting episodes: {e}")
            return []
