"""Pit Stop Strategy Analysis API endpoints"""
from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.strategy_service import strategy_service

router = APIRouter()


@router.get("/race/{year}/{race}")
async def analyze_race_strategy(year: int, race: int | str) -> Any:
    """Get comprehensive pit stop strategy analysis for a race"""
    try:
        analysis = await strategy_service.analyze_race_strategy(year, race)
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze race strategy: {str(e)}",
        )


@router.get("/driver/{year}/{race}/{driver}")
async def analyze_driver_strategy(year: int, race: int | str, driver: str) -> Any:
    """Get detailed strategy analysis for a specific driver"""
    try:
        analysis = await strategy_service.analyze_driver_strategy(year, race, driver)
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze driver strategy: {str(e)}",
        )

