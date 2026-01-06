"""Pit Stop Strategy Analysis Service"""

from typing import Any, Dict, List, Optional

import structlog

from app.services.fastf1_service import fastf1_service
from app.utils.cache import get_cache, set_cache

logger = structlog.get_logger()


class StrategyService:
    """Service for pit stop strategy analysis"""

    def __init__(self):
        pass

    async def analyze_race_strategy(
        self, year: int, race: int | str
    ) -> Dict[str, Any]:
        """Comprehensive pit stop strategy analysis for a race"""
        cache_key = f"strategy:race:{year}:{race}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get stint data
            stints = await fastf1_service.get_stint_data(year, race, "R")
            
            # Get lap times for tire degradation analysis
            laps = await fastf1_service.get_lap_times(year, race, "R")

            # Analyze strategies
            driver_strategies = self._analyze_driver_strategies(stints, laps)
            
            # Compound analysis
            compound_analysis = self._analyze_compound_performance(laps)
            
            # Pit stop timing analysis
            pit_stop_analysis = self._analyze_pit_stop_timing(stints)
            
            # Find optimal strategies
            optimal_strategies = self._identify_optimal_strategies(driver_strategies)

            analysis = {
                "year": year,
                "race": race,
                "driver_strategies": driver_strategies,
                "compound_performance": compound_analysis,
                "pit_stop_timing": pit_stop_analysis,
                "optimal_strategies": optimal_strategies,
                "summary": self._generate_summary(driver_strategies, compound_analysis),
            }

            # Cache result
            await set_cache(cache_key, analysis, 3600)

            return analysis

        except Exception as e:
            logger.error(
                "failed_to_analyze_race_strategy",
                year=year,
                race=race,
                error=str(e),
            )
            raise

    async def analyze_driver_strategy(
        self, year: int, race: int | str, driver: str
    ) -> Dict[str, Any]:
        """Detailed strategy analysis for a specific driver"""
        cache_key = f"strategy:driver:{year}:{race}:{driver}"

        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            # Get driver's stints
            all_stints = await fastf1_service.get_stint_data(year, race, "R")
            driver_stints = [s for s in all_stints if s["driver"] == driver.upper()]

            # Get driver's laps
            driver_laps = await fastf1_service.get_driver_laps(year, race, driver, "R")

            # Analyze tire degradation per stint
            degradation_analysis = self._analyze_tire_degradation(
                driver_stints, driver_laps
            )

            # Calculate stint performance
            stint_performance = self._calculate_stint_performance(
                driver_stints, driver_laps
            )

            analysis = {
                "year": year,
                "race": race,
                "driver": driver.upper(),
                "total_stints": len(driver_stints),
                "stints": driver_stints,
                "degradation_analysis": degradation_analysis,
                "stint_performance": stint_performance,
            }

            # Cache result
            await set_cache(cache_key, analysis, 3600)

            return analysis

        except Exception as e:
            logger.error(
                "failed_to_analyze_driver_strategy",
                year=year,
                race=race,
                driver=driver,
                error=str(e),
            )
            raise

    def _analyze_driver_strategies(
        self, stints: List[Dict[str, Any]], laps: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze strategy for each driver"""
        drivers = {}
        
        for stint in stints:
            driver = stint["driver"]
            if driver not in drivers:
                drivers[driver] = {
                    "driver": driver,
                    "num_stops": 0,
                    "stints": [],
                    "compounds_used": set(),
                    "total_laps": 0,
                }
            
            drivers[driver]["stints"].append(stint)
            drivers[driver]["compounds_used"].add(stint["compound"])
            drivers[driver]["total_laps"] = max(
                drivers[driver]["total_laps"], stint["end_lap"]
            )
        
        # Convert to list and calculate stops
        result = []
        for driver_data in drivers.values():
            driver_data["num_stops"] = len(driver_data["stints"]) - 1
            driver_data["compounds_used"] = list(driver_data["compounds_used"])
            
            # Sort stints by stint number
            driver_data["stints"] = sorted(
                driver_data["stints"], key=lambda x: x["stint"]
            )
            
            # Calculate strategy name (e.g., "1-stop (Soft-Medium)")
            compounds_str = "-".join([s["compound"] for s in driver_data["stints"] if s["compound"]])
            driver_data["strategy_name"] = f"{driver_data['num_stops']}-stop ({compounds_str})"
            
            result.append(driver_data)
        
        # Sort by total laps (finishing order)
        return sorted(result, key=lambda x: x["total_laps"], reverse=True)

    def _analyze_compound_performance(
        self, laps: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze performance of each tire compound"""
        compounds = {}
        
        for lap in laps:
            compound = lap.get("compound")
            lap_time = lap.get("lap_time_seconds")
            
            if compound and lap_time:
                if compound not in compounds:
                    compounds[compound] = {
                        "compound": compound,
                        "lap_times": [],
                        "avg_lap_time": 0,
                        "fastest_lap": float("inf"),
                        "slowest_lap": 0,
                        "total_laps": 0,
                    }
                
                compounds[compound]["lap_times"].append(lap_time)
                compounds[compound]["total_laps"] += 1
                compounds[compound]["fastest_lap"] = min(
                    compounds[compound]["fastest_lap"], lap_time
                )
                compounds[compound]["slowest_lap"] = max(
                    compounds[compound]["slowest_lap"], lap_time
                )
        
        # Calculate averages
        for compound_data in compounds.values():
            if compound_data["lap_times"]:
                compound_data["avg_lap_time"] = sum(compound_data["lap_times"]) / len(
                    compound_data["lap_times"]
                )
                # Remove raw lap times from response (too large)
                del compound_data["lap_times"]
        
        return compounds

    def _analyze_pit_stop_timing(
        self, stints: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze when drivers made pit stops"""
        pit_stops_by_lap = {}
        
        for stint in stints:
            # Pit stop happened at start_lap of non-first stints
            if stint["stint"] > 1:
                lap = stint["start_lap"]
                if lap not in pit_stops_by_lap:
                    pit_stops_by_lap[lap] = 0
                pit_stops_by_lap[lap] += 1
        
        # Find common pit stop windows
        common_windows = sorted(
            pit_stops_by_lap.items(), key=lambda x: x[1], reverse=True
        )[:5]
        
        return {
            "pit_stops_by_lap": pit_stops_by_lap,
            "most_common_windows": [
                {"lap": lap, "count": count} for lap, count in common_windows
            ],
        }

    def _identify_optimal_strategies(
        self, driver_strategies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Identify the most successful strategies"""
        # Group by strategy type
        strategy_groups = {}
        
        for i, driver in enumerate(driver_strategies):
            strategy = driver["strategy_name"]
            if strategy not in strategy_groups:
                strategy_groups[strategy] = {
                    "strategy": strategy,
                    "drivers": [],
                    "avg_finishing_position": 0,
                    "count": 0,
                }
            
            strategy_groups[strategy]["drivers"].append(driver["driver"])
            strategy_groups[strategy]["avg_finishing_position"] += i + 1  # 1-indexed position
            strategy_groups[strategy]["count"] += 1
        
        # Calculate averages
        for strategy_data in strategy_groups.values():
            strategy_data["avg_finishing_position"] /= strategy_data["count"]
        
        # Sort by average finishing position
        ranked_strategies = sorted(
            strategy_groups.values(),
            key=lambda x: x["avg_finishing_position"],
        )
        
        return {
            "best_strategy": ranked_strategies[0] if ranked_strategies else None,
            "all_strategies": ranked_strategies,
        }

    def _analyze_tire_degradation(
        self, stints: List[Dict[str, Any]], laps: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze tire degradation for each stint"""
        degradation = []
        
        for stint in stints:
            stint_laps = [
                lap
                for lap in laps
                if stint["start_lap"] <= lap["lap_number"] <= stint["end_lap"]
                and lap["lap_time_seconds"] is not None
            ]
            
            if len(stint_laps) >= 3:  # Need at least 3 laps for meaningful analysis
                lap_times = [lap["lap_time_seconds"] for lap in stint_laps]
                
                # Calculate degradation (difference between first and last lap)
                first_lap_time = lap_times[0]
                last_lap_time = lap_times[-1]
                degradation_seconds = last_lap_time - first_lap_time
                degradation_per_lap = degradation_seconds / len(lap_times)
                
                degradation.append({
                    "stint": stint["stint"],
                    "compound": stint["compound"],
                    "num_laps": len(lap_times),
                    "first_lap_time": first_lap_time,
                    "last_lap_time": last_lap_time,
                    "total_degradation": degradation_seconds,
                    "degradation_per_lap": degradation_per_lap,
                    "avg_lap_time": sum(lap_times) / len(lap_times),
                })
        
        return degradation

    def _calculate_stint_performance(
        self, stints: List[Dict[str, Any]], laps: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Calculate performance metrics for each stint"""
        performance = []
        
        for stint in stints:
            stint_laps = [
                lap
                for lap in laps
                if stint["start_lap"] <= lap["lap_number"] <= stint["end_lap"]
            ]
            
            valid_lap_times = [
                lap["lap_time_seconds"]
                for lap in stint_laps
                if lap["lap_time_seconds"] is not None
            ]
            
            if valid_lap_times:
                performance.append({
                    "stint": stint["stint"],
                    "compound": stint["compound"],
                    "laps_completed": len(stint_laps),
                    "avg_lap_time": sum(valid_lap_times) / len(valid_lap_times),
                    "fastest_lap": min(valid_lap_times),
                    "slowest_lap": max(valid_lap_times),
                })
        
        return performance

    def _generate_summary(
        self,
        driver_strategies: List[Dict[str, Any]],
        compound_analysis: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate a summary of the strategy analysis"""
        # Count strategy types
        strategy_counts = {}
        for driver in driver_strategies:
            stops = driver["num_stops"]
            if stops not in strategy_counts:
                strategy_counts[stops] = 0
            strategy_counts[stops] += 1
        
        # Find fastest compound
        fastest_compound = None
        fastest_time = float("inf")
        for compound_data in compound_analysis.values():
            if compound_data["avg_lap_time"] < fastest_time:
                fastest_time = compound_data["avg_lap_time"]
                fastest_compound = compound_data["compound"]
        
        return {
            "total_drivers": len(driver_strategies),
            "strategy_distribution": strategy_counts,
            "fastest_compound": fastest_compound,
            "fastest_compound_avg_time": fastest_time,
        }


# Singleton instance
strategy_service = StrategyService()

