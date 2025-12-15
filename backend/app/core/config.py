"""Application configuration"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "PyPole - F1 Analytics"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - pode ser string separada por vírgula ou lista JSON
    ALLOWED_ORIGINS: str | List[str] = "http://localhost:3000"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Cache TTL
    JOLPICA_CACHE_TTL: int = 900  # 15 minutes
    FASTF1_CACHE_TTL: int = 86400  # 24 hours
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS if it's a string"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            # Se for JSON, deixa o Pydantic parsear
            # Se for string separada por vírgula, faz split
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        return self.ALLOWED_ORIGINS


settings = Settings()

