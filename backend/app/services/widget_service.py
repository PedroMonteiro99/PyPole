"""Personalized Dashboard Widget Service"""

from typing import Any, Dict, List

import structlog

from app.services.fastf1_service import fastf1_service
from app.services.jolpica_service import jolpica_service
from app.services.profile_service import profile_service

logger = structlog.get_logger()


class WidgetService:
    """Service for personalized dashboard widgets"""

    def __init__(self):
        pass

    async def get_available_widgets(self) -> List[Dict[str, Any]]:
        """Get list of available widget types"""
        return [
            {
                "id": "next_race",
                "name": "Next Race",
                "description": "Shows information about the upcoming race",
                "category": "schedule",
                "size": "medium",
            },
            {
                "id": "driver_standings",
                "name": "Driver Standings",
                "description": "Current driver championship standings",
                "category": "standings",
                "size": "large",
            },
            {
                "id": "constructor_standings",
                "name": "Constructor Standings",
                "description": "Current constructor championship standings",
                "category": "standings",
                "size": "large",
            },
            {
                "id": "favorite_driver",
                "name": "Favorite Driver",
                "description": "Stats and info about your favorite driver",
                "category": "personalized",
                "size": "medium",
            },
            {
                "id": "favorite_team",
                "name": "Favorite Team",
                "description": "Stats and info about your favorite team",
                "category": "personalized",
                "size": "medium",
            },
            {
                "id": "race_calendar",
                "name": "Race Calendar",
                "description": "Full season race schedule",
                "category": "schedule",
                "size": "large",
            },
            {
                "id": "last_race_results",
                "name": "Last Race Results",
                "description": "Results from the most recent race",
                "category": "results",
                "size": "medium",
            },
            {
                "id": "fastest_lap",
                "name": "Fastest Lap",
                "description": "Fastest lap from recent race",
                "category": "stats",
                "size": "small",
            },
            {
                "id": "championship_leader",
                "name": "Championship Leader",
                "description": "Current championship leader stats",
                "category": "stats",
                "size": "small",
            },
            {
                "id": "recent_predictions",
                "name": "My Predictions",
                "description": "Your recent race predictions and scores",
                "category": "predictions",
                "size": "medium",
            },
        ]

    async def get_widget_data(
        self, widget_id: str, user_preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Get data for a specific widget"""
        if user_preferences is None:
            user_preferences = {}

        try:
            if widget_id == "next_race":
                return await self._get_next_race_widget()
            elif widget_id == "driver_standings":
                return await self._get_driver_standings_widget()
            elif widget_id == "constructor_standings":
                return await self._get_constructor_standings_widget()
            elif widget_id == "favorite_driver":
                return await self._get_favorite_driver_widget(user_preferences)
            elif widget_id == "favorite_team":
                return await self._get_favorite_team_widget(user_preferences)
            elif widget_id == "race_calendar":
                return await self._get_race_calendar_widget()
            elif widget_id == "last_race_results":
                return await self._get_last_race_results_widget()
            elif widget_id == "fastest_lap":
                return await self._get_fastest_lap_widget()
            elif widget_id == "championship_leader":
                return await self._get_championship_leader_widget()
            else:
                return {"error": "Widget not found"}

        except Exception as e:
            logger.error("failed_to_get_widget_data", widget_id=widget_id, error=str(e))
            return {"error": str(e)}

    async def _get_next_race_widget(self) -> Dict[str, Any]:
        """Get next race widget data"""
        next_race = await jolpica_service.get_next_race()
        return {
            "widget_id": "next_race",
            "data": next_race,
        }

    async def _get_driver_standings_widget(self, limit: int = 10) -> Dict[str, Any]:
        """Get driver standings widget data"""
        standings_data = await jolpica_service.get_driver_standings()
        return {
            "widget_id": "driver_standings",
            "data": {
                "standings": standings_data[:limit],
                "total": len(standings_data),
            },
        }

    async def _get_constructor_standings_widget(
        self, limit: int = 10
    ) -> Dict[str, Any]:
        """Get constructor standings widget data"""
        standings_data = await jolpica_service.get_constructor_standings()
        return {
            "widget_id": "constructor_standings",
            "data": {
                "standings": standings_data[:limit],
                "total": len(standings_data),
            },
        }

    async def _get_favorite_driver_widget(
        self, user_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get favorite driver widget data"""
        favorite_driver = user_preferences.get("favorite_driver")

        if not favorite_driver:
            return {
                "widget_id": "favorite_driver",
                "data": None,
                "message": "No favorite driver set",
            }

        try:
            profile = await profile_service.get_driver_profile(favorite_driver)
            return {
                "widget_id": "favorite_driver",
                "data": profile,
            }
        except Exception as e:
            return {
                "widget_id": "favorite_driver",
                "data": None,
                "error": str(e),
            }

    async def _get_favorite_team_widget(
        self, user_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get favorite team widget data"""
        favorite_team = user_preferences.get("favorite_team")

        if not favorite_team:
            return {
                "widget_id": "favorite_team",
                "data": None,
                "message": "No favorite team set",
            }

        try:
            profile = await profile_service.get_team_profile(favorite_team)
            return {
                "widget_id": "favorite_team",
                "data": profile,
            }
        except Exception as e:
            return {
                "widget_id": "favorite_team",
                "data": None,
                "error": str(e),
            }

    async def _get_race_calendar_widget(self) -> Dict[str, Any]:
        """Get race calendar widget data"""
        schedule = await jolpica_service.get_schedule()
        return {
            "widget_id": "race_calendar",
            "data": {
                "races": schedule,
                "total": len(schedule),
            },
        }

    async def _get_last_race_results_widget(self) -> Dict[str, Any]:
        """Get last race results widget data"""
        season = await jolpica_service.get_current_season()
        schedule = await jolpica_service.get_schedule(season)

        # Find the most recent completed race
        from datetime import date

        today = date.today()
        last_race = None

        for race in schedule:
            race_date = date.fromisoformat(race["date"])
            if race_date < today:
                last_race = race

        if not last_race:
            return {
                "widget_id": "last_race_results",
                "data": None,
                "message": "No completed races yet",
            }

        try:
            results = await jolpica_service.get_race_results(
                season, int(last_race["round"])
            )
            return {
                "widget_id": "last_race_results",
                "data": results,
            }
        except Exception as e:
            return {
                "widget_id": "last_race_results",
                "data": None,
                "error": str(e),
            }

    async def _get_fastest_lap_widget(self) -> Dict[str, Any]:
        """Get fastest lap widget data"""
        season = await jolpica_service.get_current_season()
        schedule = await jolpica_service.get_schedule(season)

        # Find the most recent completed race
        from datetime import date

        today = date.today()
        last_race = None

        for race in schedule:
            race_date = date.fromisoformat(race["date"])
            if race_date < today:
                last_race = race

        if not last_race:
            return {
                "widget_id": "fastest_lap",
                "data": None,
                "message": "No completed races yet",
            }

        try:
            fastest = await fastf1_service.get_fastest_lap(
                season, int(last_race["round"]), "R"
            )
            return {
                "widget_id": "fastest_lap",
                "data": {
                    "race": last_race["raceName"],
                    "fastest_lap": fastest,
                },
            }
        except Exception as e:
            return {
                "widget_id": "fastest_lap",
                "data": None,
                "error": str(e),
            }

    async def _get_championship_leader_widget(self) -> Dict[str, Any]:
        """Get championship leader widget data"""
        standings = await jolpica_service.get_driver_standings()

        if not standings:
            return {
                "widget_id": "championship_leader",
                "data": None,
                "message": "No standings available",
            }

        leader = standings[0]
        return {
            "widget_id": "championship_leader",
            "data": leader,
        }


# Singleton instance
widget_service = WidgetService()

