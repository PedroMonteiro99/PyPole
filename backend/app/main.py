"""Main FastAPI application"""
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1 import auth, comparison, fastf1, jolpica, predictor, profiles, race_weekend, strategy, widgets
from app.core.config import settings
from app.utils.cache import close_redis

# Configure structlog
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("application_startup", project=settings.PROJECT_NAME)
    yield
    # Cleanup
    logger.info("application_shutdown")
    await close_redis()


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan,
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PyPole - F1 Analytics API",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_PREFIX}/docs"
    }


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_PREFIX}/auth",
    tags=["auth"]
)

app.include_router(
    jolpica.router,
    prefix=f"{settings.API_V1_PREFIX}/jolpica",
    tags=["jolpica"]
)

app.include_router(
    fastf1.router,
    prefix=f"{settings.API_V1_PREFIX}/fastf1",
    tags=["fastf1"]
)

app.include_router(
    race_weekend.router,
    prefix=f"{settings.API_V1_PREFIX}/race-weekend",
    tags=["race-weekend"]
)

app.include_router(
    comparison.router,
    prefix=f"{settings.API_V1_PREFIX}/comparison",
    tags=["comparison"]
)

app.include_router(
    profiles.router,
    prefix=f"{settings.API_V1_PREFIX}/profiles",
    tags=["profiles"]
)

app.include_router(
    strategy.router,
    prefix=f"{settings.API_V1_PREFIX}/strategy",
    tags=["strategy"]
)

app.include_router(
    predictor.router,
    prefix=f"{settings.API_V1_PREFIX}/predictor",
    tags=["predictor"]
)

app.include_router(
    widgets.router,
    prefix=f"{settings.API_V1_PREFIX}/widgets",
    tags=["widgets"]
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

