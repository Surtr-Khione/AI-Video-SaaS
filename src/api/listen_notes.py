"""
Listen Notes API Integration
https://www.listennotes.com/api/
"""
import requests
from typing import Dict, List, Optional


class ListenNotesAPI:
    """Interface for Listen Notes API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://listen-api.listennotes.com/api/v2"

    def _get_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        return {
            "X-ListenAPI-Key": self.api_key
        }

    def search_podcasts(self, query: str, sort_by: str = "relevance",
                       genre_ids: Optional[List[str]] = None,
                       offset: int = 0, limit: int = 10) -> Dict:
        """
        Search for podcasts
        sort_by: relevance, recent_added_first
        """
        url = f"{self.base_url}/search"
        params = {
            "q": query,
            "type": "podcast",
            "sort_by_date": 1 if sort_by == "recent_added_first" else 0,
            "offset": offset,
            "len_min": limit
        }

        if genre_ids:
            params["genre_ids"] = ",".join(genre_ids)

        try:
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error searching podcasts: {e}")
            return {"results": []}

    def get_podcast_by_id(self, podcast_id: str) -> Optional[Dict]:
        """Get detailed podcast information"""
        url = f"{self.base_url}/podcasts/{podcast_id}"

        try:
            response = requests.get(url, headers=self._get_headers(), timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting podcast details: {e}")
            return None

    def get_best_podcasts(self, genre_id: Optional[str] = None,
                          region: str = "us", page: int = 1) -> Dict:
        """Get best podcasts by genre"""
        url = f"{self.base_url}/best_podcasts"
        params = {
            "region": region,
            "page": page
        }

        if genre_id:
            params["genre_id"] = genre_id

        try:
            response = requests.get(url, headers=self._get_headers(), params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting best podcasts: {e}")
            return {"podcasts": []}

    def get_podcast_recommendations(self, podcast_id: str) -> List[Dict]:
        """Get similar podcasts for market research"""
        url = f"{self.base_url}/podcasts/{podcast_id}/recommendations"

        try:
            response = requests.get(url, headers=self._get_headers(), timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("recommendations", [])
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return []
