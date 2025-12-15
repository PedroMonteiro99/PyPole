"""Jolpica F1 API endpoints for schedule and standings"""
from typing import Any, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.jolpica_service import jolpica_service

router = APIRouter()


@router.get("/schedule/current")
async def get_current_schedule() -> Any:
    """Get current season schedule"""
    try:
        schedule = await jolpica_service.get_schedule()
        return {"season": await jolpica_service.get_current_season(), "races": schedule}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schedule: {str(e)}")


@router.get("/schedule/{season}")
async def get_season_schedule(season: int) -> Any:
    """Get schedule for a specific season"""
    try:
        schedule = await jolpica_service.get_schedule(season)
        return {"season": season, "races": schedule}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch schedule for {season}: {str(e)}"
        )


@router.get("/schedule/next")
async def get_next_race() -> Any:
    """Get next upcoming race"""
    try:
        next_race = await jolpica_service.get_next_race()
        if next_race is None:
            return {"message": "No upcoming races found", "race": None}
        return {"race": next_race}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch next race: {str(e)}")


@router.get("/standings/drivers")
async def get_driver_standings(
    season: Optional[int] = Query(None, description="Season year (defaults to current)")
) -> Any:
    """Get driver standings"""
    try:
        standings = await jolpica_service.get_driver_standings(season)
        display_season = season or await jolpica_service.get_current_season()
        return {"season": display_season, "standings": standings}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch driver standings: {str(e)}"
        )


@router.get("/standings/constructors")
async def get_constructor_standings(
    season: Optional[int] = Query(None, description="Season year (defaults to current)")
) -> Any:
    """Get constructor standings"""
    try:
        standings = await jolpica_service.get_constructor_standings(season)
        display_season = season or await jolpica_service.get_current_season()
        return {"season": display_season, "standings": standings}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch constructor standings: {str(e)}"
        )


@router.get("/results/{season}/{round}")
async def get_race_results(season: int, round: int) -> Any:
    """Get race results for a specific round"""
    try:
        results = await jolpica_service.get_race_results(season, round)
        return {"season": season, "round": round, "race": results}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch results for {season} round {round}: {str(e)}"
        )


@router.get("/qualifying/{season}/{round}")
async def get_qualifying_results(season: int, round: int) -> Any:
    """Get qualifying results for a specific round"""
    try:
        results = await jolpica_service.get_qualifying_results(season, round)
        return {"season": season, "round": round, "race": results}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch qualifying for {season} round {round}: {str(e)}"
        )

