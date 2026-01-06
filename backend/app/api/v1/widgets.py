"""Dashboard Widget API endpoints"""
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_current_user
from app.db.models import User
from app.services.widget_service import widget_service

router = APIRouter()


@router.get("/available")
async def get_available_widgets() -> Any:
    """Get list of available widget types"""
    try:
        widgets = await widget_service.get_available_widgets()
        return {"widgets": widgets}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get available widgets: {str(e)}",
        )


@router.get("/data/{widget_id}")
async def get_widget_data(
    widget_id: str,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get data for a specific widget (personalized for user)"""
    try:
        user_preferences = {
            "favorite_driver": current_user.favorite_driver,
            "favorite_team": current_user.favorite_team,
        }

        widget_data = await widget_service.get_widget_data(widget_id, user_preferences)
        return widget_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get widget data: {str(e)}",
        )


@router.get("/data/{widget_id}/public")
async def get_widget_data_public(widget_id: str) -> Any:
    """Get data for a specific widget (public, no personalization)"""
    try:
        widget_data = await widget_service.get_widget_data(widget_id)
        return widget_data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get widget data: {str(e)}",
        )

