"""FastF1 service for detailed telemetry and lap data"""
import asyncio
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import fastf1
import pandas as pd
import structlog

from app.core.config import settings
from app.utils.cache import get_cache, set_cache

logger = structlog.get_logger()

# Enable FastF1 cache - create directory if it doesn't exist
# Use a local cache directory that works on Windows and Linux
CACHE_DIR = Path(__file__).parent.parent.parent / "fastf1_cache"
CACHE_DIR.mkdir(exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))


class FastF1Service:
    """Service for FastF1 detailed race data"""
    
    TIMEOUT = 30.0
    
    def __init__(self):
        pass
    
    async def _run_sync(self, func, *args, **kwargs):
        """Run synchronous FastF1 operations in thread pool"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, func, *args, **kwargs)
    
    async def get_session(
        self, year: int, race: str | int, session_type: str = "R"
    ) -> Any:
        """Get FastF1 session"""
        try:
            session = await self._run_sync(fastf1.get_session, year, race, session_type)
            await self._run_sync(session.load)
            return session
        except Exception as e:
            logger.error(
                "failed_to_load_session",
                year=year,
                race=race,
                session_type=session_type,
                error=str(e)
            )
            raise
    
    async def get_lap_times(
        self, year: int, race: str | int, session_type: str = "R"
    ) -> List[Dict[str, Any]]:
        """Get all lap times for a session"""
        cache_key = f"fastf1:laps:{year}:{race}:{session_type}"
        
        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached
        
        logger.info("cache_miss", key=cache_key)
        
        try:
            session = await self.get_session(year, race, session_type)
            laps = session.laps
            
            # Convert to dict format
            laps_data = []
            for _, lap in laps.iterrows():
                lap_dict = {
                    "driver": lap.get("Driver"),
                    "lap_number": int(lap.get("LapNumber", 0)),
                    "lap_time": str(lap.get("LapTime")) if pd.notna(lap.get("LapTime")) else None,
                    "lap_time_seconds": float(lap.get("LapTime").total_seconds()) if pd.notna(lap.get("LapTime")) else None,
                    "sector1_time": float(lap.get("Sector1Time").total_seconds()) if pd.notna(lap.get("Sector1Time")) else None,
                    "sector2_time": float(lap.get("Sector2Time").total_seconds()) if pd.notna(lap.get("Sector2Time")) else None,
                    "sector3_time": float(lap.get("Sector3Time").total_seconds()) if pd.notna(lap.get("Sector3Time")) else None,
                    "compound": lap.get("Compound"),
                    "tyre_life": int(lap.get("TyreLife", 0)) if pd.notna(lap.get("TyreLife")) else None,
                    "stint": int(lap.get("Stint", 0)),
                    "is_personal_best": bool(lap.get("IsPersonalBest", False)),
                }
                laps_data.append(lap_dict)
            
            # Cache result
            await set_cache(cache_key, laps_data, settings.FASTF1_CACHE_TTL)
            
            return laps_data
        except Exception as e:
            logger.error(
                "failed_to_fetch_lap_times",
                year=year,
                race=race,
                session_type=session_type,
                error=str(e)
            )
            raise
    
    async def get_driver_laps(
        self, year: int, race: str | int, driver: str, session_type: str = "R"
    ) -> List[Dict[str, Any]]:
        """Get lap times for a specific driver"""
        all_laps = await self.get_lap_times(year, race, session_type)
        driver_laps = [lap for lap in all_laps if lap["driver"] == driver.upper()]
        return driver_laps
    
    async def get_telemetry(
        self, year: int, race: str | int, driver: str, lap_number: int, session_type: str = "R"
    ) -> Dict[str, Any]:
        """Get telemetry data for a specific lap"""
        cache_key = f"fastf1:telemetry:{year}:{race}:{session_type}:{driver}:{lap_number}"
        
        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached
        
        logger.info("cache_miss", key=cache_key)
        
        try:
            session = await self.get_session(year, race, session_type)
            driver_laps = session.laps.pick_driver(driver.upper())
            lap = driver_laps[driver_laps["LapNumber"] == lap_number].iloc[0]
            
            # Get telemetry
            telemetry = lap.get_telemetry()
            
            # Sample telemetry data (every 10th point to reduce size)
            telemetry_sample = telemetry.iloc[::10]
            
            telemetry_data = {
                "driver": driver.upper(),
                "lap_number": lap_number,
                "lap_time": str(lap["LapTime"]) if pd.notna(lap["LapTime"]) else None,
                "compound": lap.get("Compound"),
                "telemetry": []
            }
            
            for _, point in telemetry_sample.iterrows():
                telemetry_data["telemetry"].append({
                    "distance": float(point.get("Distance", 0)),
                    "speed": float(point.get("Speed", 0)),
                    "throttle": float(point.get("Throttle", 0)),
                    "brake": bool(point.get("Brake", False)),
                    "gear": int(point.get("nGear", 0)),
                    "rpm": float(point.get("RPM", 0)) if pd.notna(point.get("RPM")) else None,
                    "drs": int(point.get("DRS", 0)) if pd.notna(point.get("DRS")) else None,
                })
            
            # Cache result
            await set_cache(cache_key, telemetry_data, settings.FASTF1_CACHE_TTL)
            
            return telemetry_data
        except Exception as e:
            logger.error(
                "failed_to_fetch_telemetry",
                year=year,
                race=race,
                driver=driver,
                lap=lap_number,
                error=str(e)
            )
            raise
    
    async def get_stint_data(
        self, year: int, race: str | int, session_type: str = "R"
    ) -> List[Dict[str, Any]]:
        """Get stint data (tire strategy) for all drivers"""
        cache_key = f"fastf1:stints:{year}:{race}:{session_type}"
        
        # Try cache first
        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached
        
        logger.info("cache_miss", key=cache_key)
        
        try:
            session = await self.get_session(year, race, session_type)
            laps = session.laps
            
            # Group by driver and stint
            stint_data = []
            for driver in laps["Driver"].unique():
                driver_laps = laps[laps["Driver"] == driver]
                
                for stint in driver_laps["Stint"].unique():
                    stint_laps = driver_laps[driver_laps["Stint"] == stint]
                    
                    if len(stint_laps) > 0:
                        first_lap = stint_laps.iloc[0]
                        last_lap = stint_laps.iloc[-1]
                        
                        stint_info = {
                            "driver": driver,
                            "stint": int(stint),
                            "compound": first_lap.get("Compound"),
                            "start_lap": int(stint_laps["LapNumber"].min()),
                            "end_lap": int(stint_laps["LapNumber"].max()),
                            "num_laps": len(stint_laps),
                            "avg_lap_time": float(stint_laps["LapTime"].mean().total_seconds()) if not stint_laps["LapTime"].isna().all() else None,
                        }
                        stint_data.append(stint_info)
            
            # Cache result
            await set_cache(cache_key, stint_data, settings.FASTF1_CACHE_TTL)
            
            return stint_data
        except Exception as e:
            logger.error(
                "failed_to_fetch_stint_data",
                year=year,
                race=race,
                session_type=session_type,
                error=str(e)
            )
            raise
    
    async def get_fastest_lap(
        self, year: int, race: str | int, session_type: str = "R"
    ) -> Optional[Dict[str, Any]]:
        """Get fastest lap of the session"""
        try:
            laps = await self.get_lap_times(year, race, session_type)
            
            # Filter out None lap times
            valid_laps = [lap for lap in laps if lap["lap_time_seconds"] is not None]
            
            if not valid_laps:
                return None
            
            fastest = min(valid_laps, key=lambda x: x["lap_time_seconds"])
            return fastest
        except Exception as e:
            logger.error(
                "failed_to_fetch_fastest_lap",
                year=year,
                race=race,
                session_type=session_type,
                error=str(e)
            )
            raise


# Singleton instance
fastf1_service = FastF1Service()

