"""FastF1 service for detailed telemetry and lap data"""

import asyncio
import functools
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import fastf1
import numpy as np
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
        # No instance state needed — all methods are stateless and use the module-level fastf1 cache
        pass

    async def _run_sync(self, func, *args, **kwargs):
        """Run synchronous FastF1 operations in thread pool"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, func, *args, **kwargs)

    async def get_session(self, year: int, race: str | int, session_type: str = "R") -> Any:
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
                error=str(e),
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
                    "lap_time_seconds": float(lap.get("LapTime").total_seconds())
                    if pd.notna(lap.get("LapTime"))
                    else None,
                    "sector1_time": float(lap.get("Sector1Time").total_seconds())
                    if pd.notna(lap.get("Sector1Time"))
                    else None,
                    "sector2_time": float(lap.get("Sector2Time").total_seconds())
                    if pd.notna(lap.get("Sector2Time"))
                    else None,
                    "sector3_time": float(lap.get("Sector3Time").total_seconds())
                    if pd.notna(lap.get("Sector3Time"))
                    else None,
                    "compound": lap.get("Compound"),
                    "tyre_life": int(lap.get("TyreLife", 0))
                    if pd.notna(lap.get("TyreLife"))
                    else None,
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
                error=str(e),
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
                "telemetry": [],
            }

            for _, point in telemetry_sample.iterrows():
                telemetry_data["telemetry"].append(
                    {
                        "distance": float(point.get("Distance", 0)),
                        "speed": float(point.get("Speed", 0)),
                        "throttle": float(point.get("Throttle", 0)),
                        "brake": bool(point.get("Brake", False)),
                        "gear": int(point.get("nGear", 0)),
                        "rpm": float(point.get("RPM", 0)) if pd.notna(point.get("RPM")) else None,
                        "drs": int(point.get("DRS", 0)) if pd.notna(point.get("DRS")) else None,
                    }
                )

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
                error=str(e),
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

                        stint_info = {
                            "driver": driver,
                            "stint": int(stint),
                            "compound": first_lap.get("Compound"),
                            "start_lap": int(stint_laps["LapNumber"].min()),
                            "end_lap": int(stint_laps["LapNumber"].max()),
                            "num_laps": len(stint_laps),
                            "avg_lap_time": float(stint_laps["LapTime"].mean().total_seconds())
                            if not stint_laps["LapTime"].isna().all()
                            else None,
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
                error=str(e),
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
                error=str(e),
            )
            raise

    async def get_track_map(
        self, year: int, race: int | str, session_type: str = "R"
    ) -> Dict[str, Any]:
        """Get normalized track outline coordinates from the fastest lap for SVG visualization"""
        cache_key = f"fastf1:track_map:{year}:{race}:{session_type}"

        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            session = await self.get_session(year, race, session_type)
            fastest = session.laps.pick_fastest()

            def _get_pos():
                return fastest.get_pos_data()

            pos_data = await self._run_sync(_get_pos)

            x_arr = pos_data["X"].values.astype(float)
            y_arr = pos_data["Y"].values.astype(float)

            valid_mask = np.isfinite(x_arr) & np.isfinite(y_arr)
            x_arr = x_arr[valid_mask]
            y_arr = y_arr[valid_mask]

            if len(x_arr) == 0:
                return {"points": [], "x_min": 0, "x_max": 0, "y_min": 0, "y_max": 0, "scale": 1}

            x_min, x_max = float(x_arr.min()), float(x_arr.max())
            y_min, y_max = float(y_arr.min()), float(y_arr.max())
            scale = max(x_max - x_min, y_max - y_min, 1.0)

            # Downsample to ~500 points for the track outline SVG
            step = max(1, len(x_arr) // 500)
            points = [
                [
                    round((float(x) - x_min) / scale * 1000, 1),
                    round((float(y) - y_min) / scale * 1000, 1),
                ]
                for x, y in zip(x_arr[::step], y_arr[::step])
            ]

            result: Dict[str, Any] = {
                "points": points,
                "x_min": x_min,
                "x_max": x_max,
                "y_min": y_min,
                "y_max": y_max,
                "scale": scale,
            }

            await set_cache(cache_key, result, settings.FASTF1_CACHE_TTL)
            return result

        except Exception as e:
            logger.error("failed_to_fetch_track_map", year=year, race=race, error=str(e))
            raise

    def _build_driver_mapping(self, session: Any) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """Build driver number→code mapping and driver info dict from a session."""
        driver_num_to_code: Dict[str, str] = {}
        driver_info: Dict[str, Any] = {}
        try:
            for num in session.drivers:
                info = session.get_driver(num)
                code = str(info.get("Abbreviation", num))
                color = str(info.get("TeamColor", "888888") or "888888")
                if not color.startswith("#"):
                    color = f"#{color}"
                driver_num_to_code[str(num)] = code
                driver_info[code] = {
                    "code": code,
                    "name": str(info.get("FullName", code)),
                    "team": str(info.get("TeamName", "")),
                    "color": color,
                }
        except Exception as e:
            logger.warning("failed_to_build_driver_info", error=str(e))
        return driver_num_to_code, driver_info

    def _lookup_driver_position(
        self,
        *,
        lap_row: Any,
        driver_pos_df: Any,
        normalize_fn: Any,
    ) -> Optional[Dict[str, Any]]:
        """Return normalised (x, y) + race data for a driver at the midpoint of a lap row."""
        lap_start = lap_row.get("LapStartTime")
        lap_time_val = lap_row.get("LapTime")

        if pd.isna(lap_start):
            return None

        try:
            mid_time = lap_start + lap_time_val / 2 if pd.notna(lap_time_val) else lap_start
            # pos_data has an integer index; search on the SessionTime column
            # Filter NaT values before searching to avoid type comparison errors
            valid_pos = driver_pos_df[driver_pos_df["SessionTime"].notna()]
            if len(valid_pos) == 0:
                return None
            idx = int(valid_pos["SessionTime"].searchsorted(mid_time))
            idx = min(idx, len(valid_pos) - 1)

            row = valid_pos.iloc[idx]
            x = float(row.get("X", float("nan")))
            y = float(row.get("Y", float("nan")))

            if not np.isfinite(x) or not np.isfinite(y):
                return None

            nx, ny = normalize_fn(x, y)
            position_val = lap_row.get("Position")
            compound_val = lap_row.get("Compound")
            laptime_val = lap_row.get("LapTime")

            return {
                "x": nx,
                "y": ny,
                "position": int(position_val) if pd.notna(position_val) else None,
                "compound": str(compound_val) if pd.notna(compound_val) else None,
                "lap_time_s": float(laptime_val.total_seconds()) if pd.notna(laptime_val) else None,
            }
        except Exception:
            return None

    def _process_single_lap(
        self,
        *,
        lap_slice: Any,
        pos_data_by_num: Dict[str, Any],
        driver_num_to_code: Dict[str, str],
        normalize_fn: Any,
    ) -> Dict[str, Any]:
        """Process a single lap slice, returning a dict of driver code → position entry."""
        drivers: Dict[str, Any] = {}
        for _, lap_row in lap_slice.iterrows():
            raw_num = lap_row.get("DriverNumber")
            if pd.isna(raw_num):
                continue
            driver_num = str(int(raw_num))
            code = driver_num_to_code.get(driver_num, str(lap_row.get("Driver", driver_num)))
            driver_pos_df = pos_data_by_num.get(driver_num)
            if driver_pos_df is None or len(driver_pos_df) == 0:
                continue
            entry = self._lookup_driver_position(
                lap_row=lap_row,
                driver_pos_df=driver_pos_df,
                normalize_fn=normalize_fn,
            )
            if entry is not None:
                drivers[code] = entry
        return drivers

    def _build_frames(
        self,
        *,
        laps_df: Any,
        pos_data_by_num: Dict[str, Any],
        driver_num_to_code: Dict[str, str],
        normalize_fn: Any,
        total_laps: int,
    ) -> List[Dict[str, Any]]:
        """Iterate over laps and build per-lap position frames."""
        frames: List[Dict[str, Any]] = []
        for lap_num in range(1, total_laps + 1):
            lap_slice = laps_df[laps_df["LapNumber"] == lap_num]
            if len(lap_slice) == 0:
                continue
            drivers = self._process_single_lap(
                lap_slice=lap_slice,
                pos_data_by_num=pos_data_by_num,
                driver_num_to_code=driver_num_to_code,
                normalize_fn=normalize_fn,
            )
            if drivers:
                frames.append({"lap": lap_num, "drivers": drivers})
        return frames

    async def get_lap_positions(self, year: int, race: int | str) -> Dict[str, Any]:
        """Get driver positions per lap for race replay — uses session.pos_data for efficiency"""
        cache_key = f"fastf1:lap_positions:{year}:{race}"

        cached = await get_cache(cache_key)
        if cached:
            logger.info("cache_hit", key=cache_key)
            return cached

        logger.info("cache_miss", key=cache_key)

        try:
            session = await self.get_session(year, race, "R")

            # Reload with telemetry so session.pos_data is populated for all drivers
            await self._run_sync(functools.partial(session.load, laps=True, telemetry=True))

            # Get coordinate normalisation bounds from fastest lap
            fastest = session.laps.pick_fastest()
            ref_pos = await self._run_sync(fastest.get_pos_data)
            x_ref = ref_pos["X"].values.astype(float)
            y_ref = ref_pos["Y"].values.astype(float)
            valid = np.isfinite(x_ref) & np.isfinite(y_ref)
            x_ref, y_ref = x_ref[valid], y_ref[valid]

            x_min = float(x_ref.min())
            y_min = float(y_ref.min())
            scale = float(max(x_ref.max() - x_min, y_ref.max() - y_min, 1.0))

            def _normalize(x: float, y: float) -> Tuple[float, float]:
                return (
                    round((x - x_min) / scale * 1000, 1),
                    round((y - y_min) / scale * 1000, 1),
                )

            driver_num_to_code, driver_info = self._build_driver_mapping(session)

            laps_df = session.laps
            total_laps = int(laps_df["LapNumber"].max()) if len(laps_df) > 0 else 0
            pos_data_by_num: Dict[str, Any] = getattr(session, "pos_data", {}) or {}

            frames = self._build_frames(
                laps_df=laps_df,
                pos_data_by_num=pos_data_by_num,
                driver_num_to_code=driver_num_to_code,
                normalize_fn=_normalize,
                total_laps=total_laps,
            )

            result = {
                "year": year,
                "race": race,
                "total_laps": total_laps,
                "frames": frames,
                "drivers": driver_info,
            }

            await set_cache(cache_key, result, settings.FASTF1_CACHE_TTL)
            return result

        except Exception as e:
            logger.error("failed_to_fetch_lap_positions", year=year, race=race, error=str(e))
            raise


# Singleton instance
fastf1_service = FastF1Service()
