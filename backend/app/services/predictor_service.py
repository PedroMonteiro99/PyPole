"""Fantasy F1 and Race Predictor Service"""

from datetime import datetime
from typing import Any, Dict, List, Optional

import structlog

from app.services.jolpica_service import jolpica_service
from app.services.profile_service import profile_service
from app.utils.cache import get_cache, set_cache

logger = structlog.get_logger()


class PredictorService:
    """Service for race predictions and fantasy F1 scoring"""

    def __init__(self):
        pass

    async def get_prediction_template(
        self, year: int, round_number: int
    ) -> Dict[str, Any]:
        """Get template for making predictions for a race"""
        cache_key = f"predictor:template:{year}:{round_number}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get race info
            schedule = await jolpica_service.get_schedule(year)
            race_info = next(
                (race for race in schedule if race.get("round") == str(round_number)),
                None,
            )

            if not race_info:
                raise ValueError(f"Race not found: {year} round {round_number}")

            # Get current driver standings for prediction context
            standings = await jolpica_service.get_driver_standings(year)

            # Get qualifying results if available (helps with predictions)
            qualifying = None
            try:
                qualifying = await jolpica_service.get_qualifying_results(
                    year, round_number
                )
            except Exception:
                pass

            template = {
                "year": year,
                "round": round_number,
                "race": race_info,
                "drivers": [
                    {
                        "driver_id": s["Driver"]["driverId"],
                        "code": s["Driver"]["code"],
                        "name": f"{s['Driver']['givenName']} {s['Driver']['familyName']}",
                        "team": s["Constructors"][0]["name"] if s["Constructors"] else None,
                        "current_position": int(s["position"]),
                        "current_points": float(s["points"]),
                        "qualifying_position": None,
                    }
                    for s in standings
                ],
                "qualifying_available": qualifying is not None,
            }

            # Add qualifying positions if available
            if qualifying and "QualifyingResults" in qualifying:
                for result in qualifying["QualifyingResults"]:
                    driver_id = result["Driver"]["driverId"]
                    for driver in template["drivers"]:
                        if driver["driver_id"] == driver_id:
                            driver["qualifying_position"] = int(result["position"])

            # Cache result
            await set_cache(cache_key, template, 3600)

            return template

        except Exception as e:
            logger.error(
                "failed_to_get_prediction_template",
                year=year,
                round=round_number,
                error=str(e),
            )
            raise

    async def calculate_prediction_score(
        self, year: int, round_number: int, predictions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate score for user's predictions against actual results"""
        try:
            # Get actual race results
            results = await jolpica_service.get_race_results(year, round_number)

            if not results or "Results" not in results:
                raise ValueError("Race results not yet available")

            # Create mapping of actual results
            actual_results = {
                r["Driver"]["driverId"]: {
                    "position": int(r["position"]),
                    "driver_id": r["Driver"]["driverId"],
                    "points": float(r["points"]),
                }
                for r in results["Results"]
            }

            # Calculate score
            total_score = 0
            detailed_scores = []

            for prediction in predictions:
                driver_id = prediction["driver_id"]
                predicted_position = prediction["predicted_position"]

                if driver_id in actual_results:
                    actual_position = actual_results[driver_id]["position"]

                    # Scoring system:
                    # - Exact position: 25 points
                    # - Off by 1: 18 points
                    # - Off by 2: 15 points
                    # - Off by 3: 12 points
                    # - Off by 4: 10 points
                    # - Off by 5: 8 points
                    # - Otherwise: max(0, 10 - difference)

                    difference = abs(predicted_position - actual_position)

                    if difference == 0:
                        points = 25
                    elif difference == 1:
                        points = 18
                    elif difference == 2:
                        points = 15
                    elif difference == 3:
                        points = 12
                    elif difference == 4:
                        points = 10
                    elif difference == 5:
                        points = 8
                    else:
                        points = max(0, 10 - difference)

                    total_score += points

                    detailed_scores.append({
                        "driver_id": driver_id,
                        "predicted_position": predicted_position,
                        "actual_position": actual_position,
                        "difference": difference,
                        "points_earned": points,
                    })

            return {
                "year": year,
                "round": round_number,
                "total_score": total_score,
                "max_possible_score": len(predictions) * 25,
                "accuracy_percentage": round(
                    (total_score / (len(predictions) * 25)) * 100, 1
                )
                if predictions
                else 0,
                "detailed_scores": detailed_scores,
            }

        except Exception as e:
            logger.error(
                "failed_to_calculate_prediction_score",
                year=year,
                round=round_number,
                error=str(e),
            )
            raise

    async def get_ai_prediction(
        self, year: int, round_number: int
    ) -> Dict[str, Any]:
        """Generate AI-based race prediction using historical data"""
        cache_key = f"predictor:ai:{year}:{round_number}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get current standings
            standings = await jolpica_service.get_driver_standings(year)

            # Get qualifying if available
            qualifying_positions = {}
            try:
                qualifying = await jolpica_service.get_qualifying_results(
                    year, round_number
                )
                if qualifying and "QualifyingResults" in qualifying:
                    qualifying_positions = {
                        r["Driver"]["driverId"]: int(r["position"])
                        for r in qualifying["QualifyingResults"]
                    }
            except Exception:
                pass

            # Simple AI prediction based on:
            # 1. Qualifying position (if available) - 60% weight
            # 2. Championship position - 30% weight
            # 3. Recent form (wins) - 10% weight

            predictions = []

            for standing in standings:
                driver_id = standing["Driver"]["driverId"]
                driver_code = standing["Driver"]["code"]

                # Base score calculation
                championship_score = 100 - int(standing["position"])
                wins_score = int(standing["wins"]) * 10

                if driver_id in qualifying_positions:
                    # If qualifying available, use it heavily
                    quali_pos = qualifying_positions[driver_id]
                    prediction_score = (
                        quali_pos * 0.6 + championship_score * 0.3 + wins_score * 0.1
                    )
                else:
                    # Otherwise, rely more on championship position
                    prediction_score = championship_score * 0.7 + wins_score * 0.3

                predictions.append({
                    "driver_id": driver_id,
                    "driver_code": driver_code,
                    "name": f"{standing['Driver']['givenName']} {standing['Driver']['familyName']}",
                    "team": standing["Constructors"][0]["name"] if standing["Constructors"] else None,
                    "prediction_score": prediction_score,
                    "qualifying_position": qualifying_positions.get(driver_id),
                    "championship_position": int(standing["position"]),
                })

            # Sort by prediction score (lower is better)
            predictions.sort(key=lambda x: x["prediction_score"])

            # Assign predicted positions
            for i, prediction in enumerate(predictions):
                prediction["predicted_position"] = i + 1

            result = {
                "year": year,
                "round": round_number,
                "predictions": predictions,
                "confidence": "high" if qualifying_positions else "medium",
                "based_on": [
                    "qualifying_results" if qualifying_positions else None,
                    "championship_standings",
                    "season_wins",
                ],
            }

            # Cache result
            await set_cache(cache_key, result, 3600)

            return result

        except Exception as e:
            logger.error(
                "failed_to_generate_ai_prediction",
                year=year,
                round=round_number,
                error=str(e),
            )
            raise

    async def get_fantasy_scoring_rules(self) -> Dict[str, Any]:
        """Get fantasy F1 scoring rules"""
        return {
            "prediction_scoring": {
                "exact_position": 25,
                "off_by_1": 18,
                "off_by_2": 15,
                "off_by_3": 12,
                "off_by_4": 10,
                "off_by_5": 8,
                "off_by_more": "max(0, 10 - difference)",
            },
            "bonus_points": {
                "predicted_podium_finish": 10,
                "predicted_winner": 25,
                "predicted_fastest_lap": 5,
            },
            "description": "Predict race finishing positions to earn points. The closer your prediction, the more points you score!",
        }


# Singleton instance
predictor_service = PredictorService()

