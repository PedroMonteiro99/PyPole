"""Driver and Team Profile Service"""

from typing import Any, Dict, List, Optional

import structlog

from app.services.fastf1_service import fastf1_service
from app.services.jolpica_service import jolpica_service
from app.utils.cache import get_cache, set_cache

logger = structlog.get_logger()


class ProfileService:
    """Service for driver and team profiles"""

    def __init__(self):
        pass

    async def get_driver_profile(
        self, driver_id: str, season: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get comprehensive driver profile with stats and history"""
        if season is None:
            season = await jolpica_service.get_current_season()

        cache_key = f"profile:driver:{driver_id}:{season}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get current standings
            standings = await jolpica_service.get_driver_standings(season)
            driver_standing = next(
                (s for s in standings if s["Driver"]["driverId"] == driver_id), None
            )

            if not driver_standing:
                raise ValueError(f"Driver {driver_id} not found in {season} season")

            # Get race results for the season
            schedule = await jolpica_service.get_schedule(season)
            race_results = []
            podiums = 0
            dnfs = 0
            total_points = 0

            for race in schedule:
                round_num = int(race["round"])
                try:
                    results = await jolpica_service.get_race_results(season, round_num)
                    if results and "Results" in results:
                        driver_result = next(
                            (
                                r
                                for r in results["Results"]
                                if r["Driver"]["driverId"] == driver_id
                            ),
                            None,
                        )

                        if driver_result:
                            position = int(driver_result["position"])
                            points = float(driver_result["points"])

                            if position <= 3:
                                podiums += 1
                            if "Finished" not in driver_result["status"]:
                                dnfs += 1

                            total_points += points

                            race_results.append({
                                "race": race["raceName"],
                                "round": round_num,
                                "position": position,
                                "grid": int(driver_result["grid"]),
                                "points": points,
                                "status": driver_result["status"],
                                "fastest_lap": driver_result.get("FastestLap"),
                            })
                except Exception as e:
                    logger.debug(
                        "race_result_not_available",
                        driver=driver_id,
                        race=race["raceName"],
                        error=str(e),
                    )

            # Calculate career stats (multi-season)
            career_stats = await self._get_career_stats(driver_id, season)

            profile_data = {
                "driver": driver_standing["Driver"],
                "current_season": {
                    "season": season,
                    "position": int(driver_standing["position"]),
                    "points": float(driver_standing["points"]),
                    "wins": int(driver_standing["wins"]),
                    "team": driver_standing["Constructors"][0] if driver_standing["Constructors"] else None,
                    "podiums": podiums,
                    "dnfs": dnfs,
                    "races_entered": len(race_results),
                },
                "race_results": race_results,
                "career": career_stats,
            }

            # Cache result
            await set_cache(cache_key, profile_data, 3600)

            return profile_data

        except Exception as e:
            logger.error(
                "failed_to_fetch_driver_profile",
                driver=driver_id,
                season=season,
                error=str(e),
            )
            raise

    async def get_team_profile(
        self, constructor_id: str, season: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get comprehensive team/constructor profile"""
        if season is None:
            season = await jolpica_service.get_current_season()

        cache_key = f"profile:team:{constructor_id}:{season}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get constructor standings
            standings = await jolpica_service.get_constructor_standings(season)
            team_standing = next(
                (
                    s
                    for s in standings
                    if s["Constructor"]["constructorId"] == constructor_id
                ),
                None,
            )

            if not team_standing:
                raise ValueError(
                    f"Constructor {constructor_id} not found in {season} season"
                )

            # Get driver standings to find drivers for this team
            driver_standings = await jolpica_service.get_driver_standings(season)
            team_drivers = [
                {
                    "driver": d["Driver"],
                    "position": int(d["position"]),
                    "points": float(d["points"]),
                    "wins": int(d["wins"]),
                }
                for d in driver_standings
                if d["Constructors"] and d["Constructors"][0]["constructorId"] == constructor_id
            ]

            # Get race results for the season
            schedule = await jolpica_service.get_schedule(season)
            race_results = []

            for race in schedule:
                round_num = int(race["round"])
                try:
                    results = await jolpica_service.get_race_results(season, round_num)
                    if results and "Results" in results:
                        team_results = [
                            {
                                "driver": r["Driver"]["code"],
                                "position": int(r["position"]),
                                "points": float(r["points"]),
                                "status": r["status"],
                            }
                            for r in results["Results"]
                            if r["Constructor"]["constructorId"] == constructor_id
                        ]

                        if team_results:
                            race_results.append({
                                "race": race["raceName"],
                                "round": round_num,
                                "results": team_results,
                                "total_points": sum(r["points"] for r in team_results),
                            })
                except Exception as e:
                    logger.debug(
                        "race_result_not_available",
                        team=constructor_id,
                        race=race["raceName"],
                        error=str(e),
                    )

            profile_data = {
                "constructor": team_standing["Constructor"],
                "current_season": {
                    "season": season,
                    "position": int(team_standing["position"]),
                    "points": float(team_standing["points"]),
                    "wins": int(team_standing["wins"]),
                    "drivers": team_drivers,
                },
                "race_results": race_results,
            }

            # Cache result
            await set_cache(cache_key, profile_data, 3600)

            return profile_data

        except Exception as e:
            logger.error(
                "failed_to_fetch_team_profile",
                team=constructor_id,
                season=season,
                error=str(e),
            )
            raise

    async def _get_career_stats(
        self, driver_id: str, current_season: int
    ) -> Dict[str, Any]:
        """Get career statistics for a driver (last 5 seasons)"""
        career_data = {
            "total_races": 0,
            "total_wins": 0,
            "total_podiums": 0,
            "total_points": 0,
            "championships": 0,
            "seasons": [],
        }

        # Check last 5 seasons
        for year in range(current_season - 4, current_season + 1):
            try:
                standings = await jolpica_service.get_driver_standings(year)
                driver_standing = next(
                    (s for s in standings if s["Driver"]["driverId"] == driver_id),
                    None,
                )

                if driver_standing:
                    position = int(driver_standing["position"])
                    wins = int(driver_standing["wins"])
                    points = float(driver_standing["points"])

                    career_data["total_wins"] += wins
                    career_data["total_points"] += points
                    if position == 1:
                        career_data["championships"] += 1

                    career_data["seasons"].append({
                        "year": year,
                        "position": position,
                        "wins": wins,
                        "points": points,
                        "team": driver_standing["Constructors"][0]["name"] if driver_standing["Constructors"] else None,
                    })

            except Exception as e:
                logger.debug(
                    "season_data_not_available",
                    driver=driver_id,
                    year=year,
                    error=str(e),
                )

        return career_data

    async def get_all_drivers(self, season: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get list of all drivers in a season"""
        if season is None:
            season = await jolpica_service.get_current_season()

        try:
            standings = await jolpica_service.get_driver_standings(season)
            return [
                {
                    "driver_id": s["Driver"]["driverId"],
                    "code": s["Driver"]["code"],
                    "name": f"{s['Driver']['givenName']} {s['Driver']['familyName']}",
                    "team": s["Constructors"][0]["name"] if s["Constructors"] else None,
                    "position": int(s["position"]),
                    "points": float(s["points"]),
                }
                for s in standings
            ]
        except Exception as e:
            logger.error("failed_to_fetch_all_drivers", season=season, error=str(e))
            raise

    async def get_all_teams(self, season: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get list of all teams in a season"""
        if season is None:
            season = await jolpica_service.get_current_season()

        try:
            standings = await jolpica_service.get_constructor_standings(season)
            return [
                {
                    "constructor_id": s["Constructor"]["constructorId"],
                    "name": s["Constructor"]["name"],
                    "nationality": s["Constructor"]["nationality"],
                    "position": int(s["position"]),
                    "points": float(s["points"]),
                    "wins": int(s["wins"]),
                }
                for s in standings
            ]
        except Exception as e:
            logger.error("failed_to_fetch_all_teams", season=season, error=str(e))
            raise


# Singleton instance
profile_service = ProfileService()

