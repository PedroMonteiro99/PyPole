"""Head-to-Head Comparison API endpoints"""
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.comparison_service import comparison_service

router = APIRouter()


@router.get("/drivers/season")
async def compare_drivers_season(
    driver1: str = Query(..., description="First driver ID (e.g., max_verstappen)"),
    driver2: str = Query(..., description="Second driver ID (e.g., hamilton)"),
    season: Optional[int] = Query(None, description="Season year (defaults to current)"),
) -> Any:
    """Compare two drivers across a full season"""
    try:
        comparison = await comparison_service.compare_drivers_season(
            driver1, driver2, season
        )
        return comparison
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compare drivers: {str(e)}",
        )


@router.get("/drivers/race")
async def compare_drivers_race(
    driver1: str = Query(..., description="First driver code (e.g., VER)"),
    driver2: str = Query(..., description="Second driver code (e.g., HAM)"),
    year: int = Query(..., description="Year"),
    race: int | str = Query(..., description="Race number or name"),
) -> Any:
    """Compare two drivers in a specific race with detailed lap data"""
    try:
        comparison = await comparison_service.compare_drivers_race(
            driver1, driver2, year, race
        )
        return comparison
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compare drivers in race: {str(e)}",
        )

