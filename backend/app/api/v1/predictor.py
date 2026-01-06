"""Fantasy F1 and Race Predictor API endpoints"""
from typing import Any, List

from fastapi import APIRouter, Body, HTTPException

from app.services.predictor_service import predictor_service

router = APIRouter()


@router.get("/template/{year}/{round}")
async def get_prediction_template(year: int, round: int) -> Any:
    """Get template for making predictions for a race"""
    try:
        template = await predictor_service.get_prediction_template(year, round)
        return template
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get prediction template: {str(e)}",
        )


@router.post("/score/{year}/{round}")
async def calculate_prediction_score(
    year: int, round: int, predictions: List[dict] = Body(...)
) -> Any:
    """Calculate score for user's predictions against actual results"""
    try:
        score = await predictor_service.calculate_prediction_score(
            year, round, predictions
        )
        return score
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate prediction score: {str(e)}",
        )


@router.get("/ai-prediction/{year}/{round}")
async def get_ai_prediction(year: int, round: int) -> Any:
    """Get AI-generated race prediction"""
    try:
        prediction = await predictor_service.get_ai_prediction(year, round)
        return prediction
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI prediction: {str(e)}",
        )


@router.get("/scoring-rules")
async def get_scoring_rules() -> Any:
    """Get fantasy F1 scoring rules"""
    try:
        rules = await predictor_service.get_fantasy_scoring_rules()
        return rules
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get scoring rules: {str(e)}",
        )

