"""Jolpica F1 service for schedule, standings, and results"""

import asyncio
from datetime import date
from typing import Any, Dict, List, Optional

import httpx
import structlog
from fastf1 import get_session

from app.core.config import settings
from app.utils.cache import get_cache, set_cache

logger = structlog.get_logger()


class JolpicaService:
    """Service for Jolpica F1 API"""

    BASE_URL = "https://api.jolpi.ca/ergast/f1"
    TIMEOUT = 10.0

    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None

    async def get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client"""
        if self.client is None:
            self.client = httpx.AsyncClient(timeout=self.TIMEOUT)
        return self.client

    async def close(self) -> None:
        """Close HTTP client"""
        if self.client:
            await self.client.aclose()
            self.client = None

    async def _fetch_with_cache(
        self, cache_key: str, url: str, ttl: Optional[int] = None
    ) -> Dict[str, Any]:
        """Fetch data with caching"""
        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        # Fetch from API
        logger.info("cache_miss", key=cache_key, url=url)
        client = await self.get_client()
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

        # Cache result
        cache_ttl = ttl or settings.JOLPICA_CACHE_TTL
        await set_cache(cache_key, data, cache_ttl)

        return data

    async def get_current_season(self) -> int:
        """Get current F1 season year"""
        from datetime import datetime

        return datetime.now().year

    async def get_schedule(self, season: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get race schedule for a season"""
        if season is None:
            season = await self.get_current_season()

        cache_key = f"jolpica:schedule:{season}"
        url = f"{self.BASE_URL}/{season}.json"

        try:
            data = await self._fetch_with_cache(cache_key, url)
            races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            return races
        except Exception as e:
            logger.error("failed_to_fetch_schedule", season=season, error=str(e))
            raise

    async def get_next_race(self) -> Optional[Dict[str, Any]]:
        """Get next upcoming race (checks next season if current season is over)"""

        current_season = await self.get_current_season()
        schedule = await self.get_schedule(current_season)
        today = date.today()

        # Check current season first
        for race in schedule:
            # Jolpica API returns dates in YYYY-MM-DD format (date-only string)
            race_date = date.fromisoformat(race["date"])
            if race_date >= today:
                return race

        # If no races found in current season, check next season
        try:
            next_season = current_season + 1
            next_schedule = await self.get_schedule(next_season)

            if next_schedule:
                # Return the first race of next season
                first_race = next_schedule[0].copy()
                # Add a flag to indicate it's from next season
                first_race["isNextSeason"] = True
                first_race["season"] = str(next_season)
                logger.info(
                    "next_race_from_next_season",
                    season=next_season,
                    race=first_race.get("raceName"),
                )
                return first_race
        except Exception as e:
            logger.warning("failed_to_fetch_next_season_schedule", season=next_season, error=str(e))

        return None

    async def get_driver_standings(self, season: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get driver standings for a season"""
        if season is None:
            season = await self.get_current_season()

        cache_key = f"jolpica:standings:drivers:{season}"
        url = f"{self.BASE_URL}/{season}/driverStandings.json"

        try:
            data = await self._fetch_with_cache(cache_key, url)
            standings_lists = (
                data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
            )
            # Handle empty standings list (e.g., season hasn't started yet)
            if not standings_lists:
                return []
            standings = standings_lists[0].get("DriverStandings", [])
            return standings
        except Exception as e:
            logger.error("failed_to_fetch_driver_standings", season=season, error=str(e))
            raise

    async def get_constructor_standings(self, season: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get constructor standings for a season"""
        if season is None:
            season = await self.get_current_season()

        cache_key = f"jolpica:standings:constructors:{season}"
        url = f"{self.BASE_URL}/{season}/constructorStandings.json"

        try:
            data = await self._fetch_with_cache(cache_key, url)
            standings_lists = (
                data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
            )
            # Handle empty standings list (e.g., season hasn't started yet)
            if not standings_lists:
                return []
            standings = standings_lists[0].get("ConstructorStandings", [])
            return standings
        except Exception as e:
            logger.error("failed_to_fetch_constructor_standings", season=season, error=str(e))
            raise

    async def get_race_results(self, season: int, round_number: int) -> Dict[str, Any]:
        """Get race results for a specific round"""
        cache_key = f"jolpica:results:{season}:{round_number}"
        url = f"{self.BASE_URL}/{season}/{round_number}/results.json"

        try:
            data = await self._fetch_with_cache(cache_key, url)
            races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            # Handle empty races list (e.g., race hasn't happened yet)
            if not races:
                return {}
            race_data = races[0]
            return race_data
        except Exception as e:
            logger.error(
                "failed_to_fetch_race_results", season=season, round=round_number, error=str(e)
            )
            raise

    async def get_qualifying_results(self, season: int, round_number: int) -> Dict[str, Any]:
        """Get qualifying results for a specific round"""
        cache_key = f"jolpica:qualifying:{season}:{round_number}"
        url = f"{self.BASE_URL}/{season}/{round_number}/qualifying.json"

        try:
            data = await self._fetch_with_cache(cache_key, url)
            races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            # Handle empty races list (e.g., qualifying hasn't happened yet)
            if not races:
                return {}
            race_data = races[0]
            return race_data
        except Exception as e:
            logger.error(
                "failed_to_fetch_qualifying_results",
                season=season,
                round=round_number,
                error=str(e),
            )
            raise


# Singleton instance
jolpica_service = JolpicaService()
