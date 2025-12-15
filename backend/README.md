# PyPole Backend - F1 Analytics API

FastAPI backend for PyPole F1 Analytics application.

## Features

- **FastAPI** - Modern async Python web framework
- **PostgreSQL** - Database with async SQLAlchemy
- **Redis** - Caching layer for external APIs
- **Jolpica F1 API** - Schedule, standings, and results
- **FastF1** - Detailed telemetry and lap data
- **JWT Authentication** - Secure user authentication
- **Rate Limiting** - 60 requests per minute per IP
- **Structured Logging** - JSON logs with structlog

## Setup

### Prerequisites

- Python 3.11+
- Poetry
- Docker & Docker Compose (for PostgreSQL and Redis)

### Installation

1. Install dependencies:
```bash
poetry install
```

2. Start PostgreSQL and Redis:
```bash
docker-compose up -d postgres redis
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and set your configuration

5. Run migrations:
```bash
poetry run alembic upgrade head
```

6. Start the server:
```bash
poetry run uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update current user
- `PUT /api/v1/auth/preferences` - Update user preferences

### Jolpica (Schedule & Standings)
- `GET /api/v1/jolpica/schedule/current` - Current season schedule
- `GET /api/v1/jolpica/schedule/{season}` - Season schedule
- `GET /api/v1/jolpica/schedule/next` - Next race
- `GET /api/v1/jolpica/standings/drivers` - Driver standings
- `GET /api/v1/jolpica/standings/constructors` - Constructor standings
- `GET /api/v1/jolpica/results/{season}/{round}` - Race results
- `GET /api/v1/jolpica/qualifying/{season}/{round}` - Qualifying results

### FastF1 (Detailed Analysis)
- `GET /api/v1/fastf1/race/{year}/{race}/laps` - All lap times
- `GET /api/v1/fastf1/race/{year}/{race}/driver/{driver}/laps` - Driver laps
- `GET /api/v1/fastf1/race/{year}/{race}/telemetry` - Telemetry data
- `GET /api/v1/fastf1/race/{year}/{race}/stints` - Tire strategies
- `GET /api/v1/fastf1/race/{year}/{race}/fastest-lap` - Fastest lap

## Development

### Run tests
```bash
poetry run pytest
```

### Format code
```bash
poetry run black .
```

### Lint code
```bash
poetry run ruff .
```

### Type check
```bash
poetry run mypy .
```

### Create migration
```bash
poetry run alembic revision --autogenerate -m "description"
```

### Apply migrations
```bash
poetry run alembic upgrade head
```

## Docker

Build and run everything with Docker Compose:

```bash
docker-compose up --build
```

## Cache Strategy

- **Jolpica data**: 15 minutes TTL (frequently changing data)
- **FastF1 data**: 24 hours TTL (historical data doesn't change)

Cache keys:
- `jolpica:schedule:{season}`
- `jolpica:standings:drivers:{season}`
- `jolpica:standings:constructors:{season}`
- `fastf1:laps:{year}:{race}:{session_type}`
- `fastf1:telemetry:{year}:{race}:{session_type}:{driver}:{lap}`
- `fastf1:stints:{year}:{race}:{session_type}`

## Architecture

```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── core/         # Configuration & security
│   ├── db/           # Database models & session
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # External API services
│   └── utils/        # Utilities (cache, etc)
├── alembic/          # Database migrations
└── tests/            # Tests
```

