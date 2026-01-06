"""Head-to-Head Comparison Service"""

from typing import Any, Dict, List, Optional

import structlog

from app.services.fastf1_service import fastf1_service
from app.services.jolpica_service import jolpica_service
from app.utils.cache import get_cache, set_cache

logger = structlog.get_logger()


class ComparisonService:
    """Service for comparing drivers head-to-head"""

    def __init__(self):
        pass

    async def compare_drivers_season(
        self, driver1_id: str, driver2_id: str, season: Optional[int] = None
    ) -> Dict[str, Any]:
        """Compare two drivers across a full season"""
        if season is None:
            season = await jolpica_service.get_current_season()

        cache_key = f"comparison:drivers:{driver1_id}:{driver2_id}:{season}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get standings to find driver info
            standings = await jolpica_service.get_driver_standings(season)

            driver1_data = next(
                (s for s in standings if s["Driver"]["driverId"] == driver1_id), None
            )
            driver2_data = next(
                (s for s in standings if s["Driver"]["driverId"] == driver2_id), None
            )

            if not driver1_data or not driver2_data:
                raise ValueError("One or both drivers not found in standings")

            # Get race results for detailed comparison
            schedule = await jolpica_service.get_schedule(season)
            race_comparisons = []

            for race in schedule:
                round_num = int(race["round"])
                try:
                    results = await jolpica_service.get_race_results(season, round_num)
                    if results and "Results" in results:
                        race_results = results["Results"]

                        driver1_result = next(
                            (
                                r
                                for r in race_results
                                if r["Driver"]["driverId"] == driver1_id
                            ),
                            None,
                        )
                        driver2_result = next(
                            (
                                r
                                for r in race_results
                                if r["Driver"]["driverId"] == driver2_id
                            ),
                            None,
                        )

                        if driver1_result and driver2_result:
                            race_comparisons.append({
                                "race": race["raceName"],
                                "round": round_num,
                                "driver1": {
                                    "position": int(driver1_result["position"]),
                                    "points": float(driver1_result["points"]),
                                    "grid": int(driver1_result["grid"]),
                                    "status": driver1_result["status"],
                                },
                                "driver2": {
                                    "position": int(driver2_result["position"]),
                                    "points": float(driver2_result["points"]),
                                    "grid": int(driver2_result["grid"]),
                                    "status": driver2_result["status"],
                                },
                                "winner": (
                                    driver1_id
                                    if int(driver1_result["position"])
                                    < int(driver2_result["position"])
                                    else driver2_id
                                ),
                            })
                except Exception as e:
                    logger.debug(
                        "race_result_not_available",
                        race=race["raceName"],
                        error=str(e),
                    )

            # Calculate head-to-head stats
            h2h_stats = self._calculate_h2h_stats(
                driver1_id, driver2_id, race_comparisons
            )

            comparison_data = {
                "season": season,
                "driver1": {
                    "id": driver1_id,
                    "info": driver1_data["Driver"],
                    "team": driver1_data["Constructors"][0] if driver1_data["Constructors"] else None,
                    "position": int(driver1_data["position"]),
                    "points": float(driver1_data["points"]),
                    "wins": int(driver1_data["wins"]),
                },
                "driver2": {
                    "id": driver2_id,
                    "info": driver2_data["Driver"],
                    "team": driver2_data["Constructors"][0] if driver2_data["Constructors"] else None,
                    "position": int(driver2_data["position"]),
                    "points": float(driver2_data["points"]),
                    "wins": int(driver2_data["wins"]),
                },
                "head_to_head": h2h_stats,
                "race_by_race": race_comparisons,
            }

            # Cache result
            await set_cache(cache_key, comparison_data, 3600)

            return comparison_data

        except Exception as e:
            logger.error(
                "failed_to_compare_drivers",
                driver1=driver1_id,
                driver2=driver2_id,
                season=season,
                error=str(e),
            )
            raise

    async def compare_drivers_race(
        self, driver1_code: str, driver2_code: str, year: int, race: int | str
    ) -> Dict[str, Any]:
        """Compare two drivers in a specific race with detailed telemetry"""
        cache_key = f"comparison:race:{driver1_code}:{driver2_code}:{year}:{race}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get lap data for both drivers
            driver1_laps = await fastf1_service.get_driver_laps(
                year, race, driver1_code, "R"
            )
            driver2_laps = await fastf1_service.get_driver_laps(
                year, race, driver2_code, "R"
            )

            # Find fastest laps
            driver1_fastest = min(
                (lap for lap in driver1_laps if lap["lap_time_seconds"]),
                key=lambda x: x["lap_time_seconds"],
                default=None,
            )
            driver2_fastest = min(
                (lap for lap in driver2_laps if lap["lap_time_seconds"]),
                key=lambda x: x["lap_time_seconds"],
                default=None,
            )

            # Calculate average lap times
            driver1_avg = (
                sum(
                    lap["lap_time_seconds"]
                    for lap in driver1_laps
                    if lap["lap_time_seconds"]
                )
                / len([lap for lap in driver1_laps if lap["lap_time_seconds"]])
                if driver1_laps
                else None
            )
            driver2_avg = (
                sum(
                    lap["lap_time_seconds"]
                    for lap in driver2_laps
                    if lap["lap_time_seconds"]
                )
                / len([lap for lap in driver2_laps if lap["lap_time_seconds"]])
                if driver2_laps
                else None
            )

            comparison_data = {
                "year": year,
                "race": race,
                "driver1": {
                    "code": driver1_code.upper(),
                    "fastest_lap": driver1_fastest,
                    "average_lap_time": driver1_avg,
                    "total_laps": len(driver1_laps),
                    "all_laps": driver1_laps,
                },
                "driver2": {
                    "code": driver2_code.upper(),
                    "fastest_lap": driver2_fastest,
                    "average_lap_time": driver2_avg,
                    "total_laps": len(driver2_laps),
                    "all_laps": driver2_laps,
                },
                "delta": {
                    "fastest_lap": (
                        driver1_fastest["lap_time_seconds"]
                        - driver2_fastest["lap_time_seconds"]
                        if driver1_fastest and driver2_fastest
                        else None
                    ),
                    "average_lap": (
                        driver1_avg - driver2_avg if driver1_avg and driver2_avg else None
                    ),
                },
            }

            # Cache result
            await set_cache(cache_key, comparison_data, 3600)

            return comparison_data

        except Exception as e:
            logger.error(
                "failed_to_compare_drivers_race",
                driver1=driver1_code,
                driver2=driver2_code,
                year=year,
                race=race,
                error=str(e),
            )
            raise

    def _calculate_h2h_stats(
        self, driver1_id: str, driver2_id: str, race_comparisons: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate head-to-head statistics"""
        if not race_comparisons:
            return {
                "races_compared": 0,
                "driver1_wins": 0,
                "driver2_wins": 0,
                "points_difference": 0,
            }

        driver1_wins = sum(1 for race in race_comparisons if race["winner"] == driver1_id)
        driver2_wins = sum(1 for race in race_comparisons if race["winner"] == driver2_id)

        total_points_driver1 = sum(race["driver1"]["points"] for race in race_comparisons)
        total_points_driver2 = sum(race["driver2"]["points"] for race in race_comparisons)

        return {
            "races_compared": len(race_comparisons),
            "driver1_wins": driver1_wins,
            "driver2_wins": driver2_wins,
            "driver1_percentage": round(driver1_wins / len(race_comparisons) * 100, 1),
            "driver2_percentage": round(driver2_wins / len(race_comparisons) * 100, 1),
            "total_points_driver1": total_points_driver1,
            "total_points_driver2": total_points_driver2,
            "points_difference": total_points_driver1 - total_points_driver2,
        }


# Singleton instance
comparison_service = ComparisonService()

