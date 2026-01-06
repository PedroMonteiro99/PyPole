"""Race Weekend Hub Service - Aggregates all data for a race weekend"""

from datetime import datetime
from typing import Any, Dict, List, Optional

import structlog

from app.services.fastf1_service import fastf1_service
from app.services.jolpica_service import jolpica_service
from app.utils.cache import get_cache, set_cache

logger = structlog.get_logger()


class RaceWeekendService:
    """Service for aggregating race weekend data"""

    def __init__(self):
        pass

    async def get_race_weekend_hub(
        self, year: int, round_number: int
    ) -> Dict[str, Any]:
        """
        Get comprehensive race weekend data including:
        - Race info and schedule
        - Results (if available)
        - Qualifying results (if available)
        - Practice sessions info
        - Weather conditions
        - Circuit info
        - Key stats
        """
        cache_key = f"race_weekend:hub:{year}:{round_number}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get race information from schedule
            schedule = await jolpica_service.get_schedule(year)
            race_info = next(
                (race for race in schedule if race.get("round") == str(round_number)),
                None,
            )

            if not race_info:
                raise ValueError(f"Race not found: {year} round {round_number}")

            # Build comprehensive weekend data
            weekend_data = {
                "year": year,
                "round": round_number,
                "race_info": race_info,
                "sessions": await self._get_session_schedule(race_info),
                "results": None,
                "qualifying": None,
                "sprint": None,
                "fastest_laps": {},
                "pit_stops": None,
                "weather": None,
                "status": await self._determine_weekend_status(race_info),
            }

            # Try to get results if race has happened
            try:
                results = await jolpica_service.get_race_results(year, round_number)
                if results:
                    weekend_data["results"] = results
            except Exception as e:
                logger.debug("no_race_results", year=year, round=round_number, error=str(e))

            # Try to get qualifying results
            try:
                qualifying = await jolpica_service.get_qualifying_results(year, round_number)
                if qualifying:
                    weekend_data["qualifying"] = qualifying
            except Exception as e:
                logger.debug("no_qualifying_results", year=year, round=round_number, error=str(e))

            # Try to get FastF1 data (fastest laps, pit stops)
            try:
                fastest_lap = await fastf1_service.get_fastest_lap(year, round_number, "R")
                weekend_data["fastest_laps"]["race"] = fastest_lap
            except Exception as e:
                logger.debug("no_fastf1_race_data", year=year, round=round_number, error=str(e))

            try:
                stints = await fastf1_service.get_stint_data(year, round_number, "R")
                weekend_data["pit_stops"] = await self._process_pit_stops(stints)
            except Exception as e:
                logger.debug("no_stint_data", year=year, round=round_number, error=str(e))

            # Cache result for 5 minutes (data can change during race weekend)
            await set_cache(cache_key, weekend_data, 300)

            return weekend_data

        except Exception as e:
            logger.error(
                "failed_to_fetch_race_weekend_hub",
                year=year,
                round=round_number,
                error=str(e),
            )
            raise

    async def _get_session_schedule(self, race_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract session schedule from race info"""
        sessions = []

        # Race session (main event)
        sessions.append({
            "type": "race",
            "name": "Race",
            "date": race_info.get("date"),
            "time": race_info.get("time"),
        })

        # Practice sessions
        if "FirstPractice" in race_info:
            sessions.append({
                "type": "practice",
                "name": "Practice 1",
                "date": race_info["FirstPractice"].get("date"),
                "time": race_info["FirstPractice"].get("time"),
            })

        if "SecondPractice" in race_info:
            sessions.append({
                "type": "practice",
                "name": "Practice 2",
                "date": race_info["SecondPractice"].get("date"),
                "time": race_info["SecondPractice"].get("time"),
            })

        if "ThirdPractice" in race_info:
            sessions.append({
                "type": "practice",
                "name": "Practice 3",
                "date": race_info["ThirdPractice"].get("date"),
                "time": race_info["ThirdPractice"].get("time"),
            })

        # Qualifying
        if "Qualifying" in race_info:
            sessions.append({
                "type": "qualifying",
                "name": "Qualifying",
                "date": race_info["Qualifying"].get("date"),
                "time": race_info["Qualifying"].get("time"),
            })

        # Sprint (if available)
        if "Sprint" in race_info:
            sessions.append({
                "type": "sprint",
                "name": "Sprint",
                "date": race_info["Sprint"].get("date"),
                "time": race_info["Sprint"].get("time"),
            })

        return sessions

    async def _determine_weekend_status(self, race_info: Dict[str, Any]) -> str:
        """Determine the status of the race weekend"""
        from datetime import date

        race_date = datetime.fromisoformat(race_info["date"]).date()
        today = date.today()

        # Check if race has started (first practice)
        if "FirstPractice" in race_info:
            fp1_date = datetime.fromisoformat(race_info["FirstPractice"]["date"]).date()
            if today < fp1_date:
                return "upcoming"
            elif today >= race_date:
                return "completed"
            else:
                return "in_progress"
        else:
            if today < race_date:
                return "upcoming"
            else:
                return "completed"

    async def _process_pit_stops(self, stints: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process stint data to extract pit stop information"""
        pit_stops = []

        # Group by driver
        drivers = {}
        for stint in stints:
            driver = stint["driver"]
            if driver not in drivers:
                drivers[driver] = []
            drivers[driver].append(stint)

        # Extract pit stops (transitions between stints)
        for driver, driver_stints in drivers.items():
            sorted_stints = sorted(driver_stints, key=lambda x: x["stint"])
            for i, stint in enumerate(sorted_stints):
                if i > 0:  # Pit stop occurred before this stint
                    pit_stops.append({
                        "driver": driver,
                        "stop_number": i,
                        "lap": stint["start_lap"],
                        "from_compound": sorted_stints[i - 1]["compound"],
                        "to_compound": stint["compound"],
                        "stint_length": sorted_stints[i - 1]["num_laps"],
                    })

        return {
            "total_stops": len(pit_stops),
            "stops": pit_stops,
        }

    async def get_current_or_next_weekend(self) -> Optional[Dict[str, Any]]:
        """Get data for the current or next race weekend"""
        try:
            next_race = await jolpica_service.get_next_race()
            if not next_race:
                return None

            year = int(next_race.get("season", datetime.now().year))
            round_number = int(next_race.get("round", 1))

            return await self.get_race_weekend_hub(year, round_number)

        except Exception as e:
            logger.error("failed_to_fetch_current_next_weekend", error=str(e))
            raise


# Singleton instance
race_weekend_service = RaceWeekendService()

