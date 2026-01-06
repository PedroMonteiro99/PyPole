"""Race Weekend Hub API endpoints"""
from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.race_weekend_service import race_weekend_service

router = APIRouter()


@router.get("/current")
async def get_current_weekend() -> Any:
    """Get data for the current or next race weekend"""
    try:
        weekend_data = await race_weekend_service.get_current_or_next_weekend()
        if not weekend_data:
            return {"message": "No upcoming race weekend found"}
        return weekend_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch current weekend: {str(e)}"
        )


@router.get("/{year}/{round}")
async def get_race_weekend(year: int, round: int) -> Any:
    """Get comprehensive data for a specific race weekend"""
    try:
        weekend_data = await race_weekend_service.get_race_weekend_hub(year, round)
        return weekend_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch race weekend data: {str(e)}",
        )

