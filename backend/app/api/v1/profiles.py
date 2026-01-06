"""Driver and Team Profile API endpoints"""
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.profile_service import profile_service

router = APIRouter()


@router.get("/drivers")
async def get_all_drivers(
    season: Optional[int] = Query(None, description="Season year (defaults to current)")
) -> Any:
    """Get list of all drivers in a season"""
    try:
        drivers = await profile_service.get_all_drivers(season)
        return {"season": season, "drivers": drivers}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch drivers: {str(e)}",
        )


@router.get("/drivers/{driver_id}")
async def get_driver_profile(
    driver_id: str,
    season: Optional[int] = Query(None, description="Season year (defaults to current)"),
) -> Any:
    """Get comprehensive driver profile"""
    try:
        profile = await profile_service.get_driver_profile(driver_id, season)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch driver profile: {str(e)}",
        )


@router.get("/teams")
async def get_all_teams(
    season: Optional[int] = Query(None, description="Season year (defaults to current)")
) -> Any:
    """Get list of all teams in a season"""
    try:
        teams = await profile_service.get_all_teams(season)
        return {"season": season, "teams": teams}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch teams: {str(e)}",
        )


@router.get("/teams/{constructor_id}")
async def get_team_profile(
    constructor_id: str,
    season: Optional[int] = Query(None, description="Season year (defaults to current)"),
) -> Any:
    """Get comprehensive team profile"""
    try:
        profile = await profile_service.get_team_profile(constructor_id, season)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch team profile: {str(e)}",
        )

