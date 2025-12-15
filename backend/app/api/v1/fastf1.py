"""FastF1 API endpoints for detailed race analysis"""
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.fastf1_service import fastf1_service

router = APIRouter()


@router.get("/race/{year}/{race}/laps")
async def get_lap_times(
    year: int,
    race: int | str,
    session_type: str = Query("R", description="Session type: FP1, FP2, FP3, Q, S, R")
) -> Any:
    """Get all lap times for a session"""
    try:
        laps = await fastf1_service.get_lap_times(year, race, session_type)
        return {
            "year": year,
            "race": race,
            "session_type": session_type,
            "laps": laps,
            "total_laps": len(laps)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lap times: {str(e)}"
        )


@router.get("/race/{year}/{race}/driver/{driver}/laps")
async def get_driver_laps(
    year: int,
    race: int | str,
    driver: str,
    session_type: str = Query("R", description="Session type: FP1, FP2, FP3, Q, S, R")
) -> Any:
    """Get lap times for a specific driver"""
    try:
        laps = await fastf1_service.get_driver_laps(year, race, driver, session_type)
        return {
            "year": year,
            "race": race,
            "driver": driver.upper(),
            "session_type": session_type,
            "laps": laps,
            "total_laps": len(laps)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch driver laps: {str(e)}"
        )


@router.get("/race/{year}/{race}/telemetry")
async def get_telemetry(
    year: int,
    race: int | str,
    driver: str = Query(..., description="Driver code (e.g., VER, HAM)"),
    lap: int = Query(..., description="Lap number"),
    session_type: str = Query("R", description="Session type: FP1, FP2, FP3, Q, S, R")
) -> Any:
    """Get telemetry data for a specific lap"""
    try:
        telemetry = await fastf1_service.get_telemetry(year, race, driver, lap, session_type)
        return telemetry
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch telemetry: {str(e)}"
        )


@router.get("/race/{year}/{race}/stints")
async def get_stint_data(
    year: int,
    race: int | str,
    session_type: str = Query("R", description="Session type: FP1, FP2, FP3, Q, S, R")
) -> Any:
    """Get tire stint data for all drivers"""
    try:
        stints = await fastf1_service.get_stint_data(year, race, session_type)
        return {
            "year": year,
            "race": race,
            "session_type": session_type,
            "stints": stints
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch stint data: {str(e)}"
        )


@router.get("/race/{year}/{race}/fastest-lap")
async def get_fastest_lap(
    year: int,
    race: int | str,
    session_type: str = Query("R", description="Session type: FP1, FP2, FP3, Q, S, R")
) -> Any:
    """Get fastest lap of the session"""
    try:
        fastest_lap = await fastf1_service.get_fastest_lap(year, race, session_type)
        if fastest_lap is None:
            return {
                "message": "No valid lap times found",
                "fastest_lap": None
            }
        return {
            "year": year,
            "race": race,
            "session_type": session_type,
            "fastest_lap": fastest_lap
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch fastest lap: {str(e)}"
        )

