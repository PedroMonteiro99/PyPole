# PyPole

<p align="center">
   <img src="./frontend/public/favicon.svg" alt="F1 Logo" width="150" />
</p>

<p align="center">
  <strong>Formula 1 Full-Stack Analytics Platform</strong>
</p>

<p align="center">
   A comprehensive F1 data analytics application featuring real-time telemetry analysis, driver comparisons, race predictions, and interactive visualizations.
</p>

<p align="center">
   <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white" alt="Python">
   <img src="https://img.shields.io/badge/FastAPI-0.128+-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI">
   <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white" alt="Next.js">
   <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React">
   <img src="https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
   <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker Compose">
   <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
   <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=flat&logo=redis&logoColor=white" alt="Redis">
   <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
</p>

---

## 📋 Overview

PyPole is a modern, full-stack Formula 1 analytics platform that combines historical race data, real-time telemetry, and predictive analytics to provide deep insights into F1 performance. Built with a focus on performance, scalability, and user experience.

### Key Features

🏁 **Real-Time Race Analysis** - Live telemetry data, lap times, and sector analysis  
📊 **Driver & Team Comparisons** - Head-to-head performance metrics across seasons  
🎯 **Race Predictions** - ML-powered race outcome predictions  
📈 **Interactive Visualizations** - Dynamic charts for lap times, tire strategies, and positions  
👤 **Driver & Team Profiles** - Comprehensive statistics and historical performance  
🗓️ **Season Calendar** - Complete race schedules with circuit information  
🏆 **Live Standings** - Real-time driver and constructor championships  
⚙️ **Strategy Analysis** - Pit stop strategies and tire compound performance  
🎨 **Customizable Dashboard** - Personalized widgets and team themes

---

## 🛠️ Tech Stack

### Backend

<p align="center">
   <img src="https://img.shields.io/badge/FastAPI-0.128.0-009688?style=flat&logo=fastapi" alt="FastAPI"  />
   <img src="https://img.shields.io/badge/SQLAlchemy-2.0-red?style=flat" alt="SQLAlchemy"  />
   <img src="https://img.shields.io/badge/Pydantic-2.9-E92063?style=flat" alt="Pydantic"  />
   <img src="https://img.shields.io/badge/Alembic-1.13-blue?style=flat" alt="Alembic"  />
   <img src="https://img.shields.io/badge/FastF1-3.4-orange?style=flat" alt="FastF1"  />
</p>

- **Framework**: FastAPI with async/await support
- **Database**: PostgreSQL with SQLAlchemy ORM (async)
- **Cache**: Redis for API response caching
- **Authentication**: JWT tokens with bcrypt password hashing
- **Rate Limiting**: SlowAPI (60 requests/minute per IP)
- **Logging**: Structured logging with structlog
- **Data Sources**: FastF1 (telemetry) + Jolpica F1 API (historical data)
- **Migrations**: Alembic for database schema management

### Frontend

<p align="center">
   <img src="https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js" alt="Next.js"  />
   <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react" alt="React"  />
   <img src="https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS"  />
   <img src="https://img.shields.io/badge/TanStack_Query-5.62-FF4154?style=flat" alt="TanStack Query"  />
   <img src="https://img.shields.io/badge/Recharts-3.0-8884d8?style=flat" alt="Recharts"  />
</p>

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **UI Components**: Shadcn/ui + Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS 4.1 with custom F1 team themes
- **Theme**: Dark/Light mode with next-themes
- **HTTP Client**: Axios with interceptors

---

## 🚀 Features Breakdown

### 📊 Dashboard

- Customizable widget system
- Next race countdown and details
- Championship leader highlights
- Top 5 driver standings
- Favorite driver/team quick stats

### 🗓️ Schedule & Calendar

- Full season race calendar
- Circuit information and locations
- Race weekend session times
- Historical race results

### 🏆 Standings

- Live driver championship standings
- Constructor championship rankings
- Points progression charts
- Team color-coded displays

### 🔍 Race Analysis

- Lap-by-lap time comparisons
- Tire strategy visualization
- Position changes throughout race
- Fastest lap analysis
- Session selection (FP1, FP2, FP3, Qualifying, Sprint, Race)

### 👥 Driver Comparisons

- Season-long performance comparison
- Head-to-head race statistics
- Qualifying vs race pace analysis
- Points and podium comparisons

### 🎯 Race Predictor

- ML-based race outcome predictions
- Historical performance analysis
- Circuit-specific predictions

### ⚙️ Strategy Analyzer

- Pit stop timing analysis
- Tire compound performance
- Stint length optimization

### 👤 Driver & Team Profiles

- Career statistics
- Season-by-season breakdown
- Team history and achievements

---

## 📦 Installation

### Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18 or higher
- **Docker** & Docker Compose
- **Poetry** (Python dependency manager)
- **npm** or **yarn**

### Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/pypole.git
cd pypole

# Start all services
docker-compose up --build
```

This will start:

- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 8000)

Then start the frontend separately:

```bash
cd frontend
npm install
npm run dev
```

Access the application:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/v1/docs

### Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
poetry install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, REDIS_URL, SECRET_KEY

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
poetry run alembic upgrade head

# Start development server
poetry run uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with backend URL
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

---

## 📁 Project Structure

```
PyPole/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py           # Authentication endpoints
│   │   │       ├── jolpica.py        # Historical F1 data
│   │   │       ├── fastf1.py         # Telemetry data
│   │   │       ├── comparison.py     # Driver comparisons
│   │   │       ├── predictor.py      # Race predictions
│   │   │       ├── profiles.py       # Driver/team profiles
│   │   │       ├── race_weekend.py   # Race weekend data
│   │   │       ├── strategy.py       # Strategy analysis
│   │   │       └── widgets.py        # Dashboard widgets
│   │   ├── core/
│   │   │   ├── config.py             # App configuration
│   │   │   └── security.py           # JWT & auth logic
│   │   ├── db/
│   │   │   ├── models.py             # SQLAlchemy models
│   │   │   └── session.py            # Database session
│   │   ├── schemas/                  # Pydantic schemas
│   │   ├── services/                 # External API services
│   │   └── utils/                    # Utilities (cache, etc)
│   ├── alembic/                      # Database migrations
│   ├── pyproject.toml                # Poetry dependencies
│   └── Dockerfile
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/                   # Auth pages (login, register)
│   │   ├── (protected)/              # Protected pages
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── schedule/             # Race calendar
│   │   │   ├── standings/            # Championships
│   │   │   ├── race/                 # Race analysis
│   │   │   ├── comparison/           # Driver comparison
│   │   │   ├── predictor/            # Race predictor
│   │   │   ├── strategy/             # Strategy analyzer
│   │   │   ├── drivers/              # Driver profiles
│   │   │   ├── teams/                # Team profiles
│   │   │   └── settings/             # User settings
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── DashboardWidget.tsx
│   │   ├── LapTimeChart.tsx
│   │   ├── PositionChart.tsx
│   │   ├── PitStopsChart.tsx
│   │   ├── StandingsTable.tsx
│   │   └── ...
│   ├── hooks/                        # Custom React hooks
│   ├── lib/
│   │   ├── api.ts                    # Axios instance
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── types.ts                  # TypeScript types
│   │   └── utils.ts                  # Helper functions
│   ├── providers/                    # Context providers
│   └── package.json
│
└── docker-compose.yml
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login user
GET    /api/v1/auth/me                Get current user
PUT    /api/v1/auth/me                Update user profile
PUT    /api/v1/auth/preferences       Update user preferences
```

### Jolpica (Historical Data)

```
GET    /api/v1/jolpica/schedule/current           Current season calendar
GET    /api/v1/jolpica/schedule/{season}          Season calendar
GET    /api/v1/jolpica/schedule/next              Next race
GET    /api/v1/jolpica/standings/drivers          Driver standings
GET    /api/v1/jolpica/standings/constructors     Constructor standings
GET    /api/v1/jolpica/results/{season}/{round}   Race results
```

### FastF1 (Telemetry)

```
GET    /api/v1/fastf1/race/{year}/{race}/laps                    All lap times
GET    /api/v1/fastf1/race/{year}/{race}/driver/{driver}/laps    Driver laps
GET    /api/v1/fastf1/race/{year}/{race}/telemetry               Telemetry data
GET    /api/v1/fastf1/race/{year}/{race}/stints                  Tire strategies
GET    /api/v1/fastf1/race/{year}/{race}/fastest-lap             Fastest lap
```

### Comparisons

```
GET    /api/v1/comparison/drivers/season          Compare drivers (season)
GET    /api/v1/comparison/drivers/race            Compare drivers (race)
```

### Profiles

```
GET    /api/v1/profiles/drivers                   All drivers
GET    /api/v1/profiles/drivers/{driver_id}       Driver profile
GET    /api/v1/profiles/teams/{team_id}           Team profile
```

### Widgets

```
GET    /api/v1/widgets/data/next_race             Next race widget
GET    /api/v1/widgets/data/championship_leader   Leader widget
GET    /api/v1/widgets/data/favorite_driver       Favorite driver widget
```

### Race Weekend

```
GET    /api/v1/race-weekend/{year}/{round}        Race weekend data
```

### Strategy

```
GET    /api/v1/strategy/analysis/{year}/{round}   Strategy analysis
```

### Predictor

```
POST   /api/v1/predictor/predict                  Predict race outcome
```

---

## 💾 Caching Strategy

PyPole implements intelligent caching to optimize performance and reduce external API calls:

### Cache Durations

- **Jolpica Data** (Historical): 15 minutes
- **FastF1 Data** (Telemetry): 24 hours
- **User Preferences**: No cache (always fresh)

### Cache Keys

```
jolpica:schedule:{season}
jolpica:standings:drivers:{season}
jolpica:standings:constructors:{season}
jolpica:results:{season}:{round}
fastf1:laps:{year}:{race}:{session_type}
fastf1:telemetry:{year}:{race}:{session_type}:{driver}:{lap}
fastf1:stints:{year}:{race}:{session_type}
```

---

## 🧪 Development

### Backend

```bash
# Run tests
poetry run pytest

# Code formatting
poetry run black .

# Linting
poetry run ruff .

# Type checking
poetry run mypy .

# Create new migration
poetry run alembic revision --autogenerate -m "description"

# Apply migrations
poetry run alembic upgrade head

# Rollback migration
poetry run alembic downgrade -1
```

### Frontend

```bash
# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🌐 Deployment

### Backend Deployment

1. Set production environment variables:

   ```bash
   DATABASE_URL=postgresql://user:pass@host:5432/pypole
   REDIS_URL=redis://host:6379/0
   SECRET_KEY=your-secret-key
   DEBUG=false
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

2. Install production dependencies:

   ```bash
   poetry install --no-dev
   ```

3. Run migrations:

   ```bash
   poetry run alembic upgrade head
   ```

4. Start with production server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

### Frontend Deployment

1. Set production environment variable:

   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   ```

2. Build for production:

   ```bash
   npm run build
   ```

3. Deploy to:
   - **Vercel** (recommended for Next.js)
   - **Netlify**
   - **AWS Amplify**
   - Any Node.js hosting platform

---

## 🔒 Security Features

- JWT-based authentication with secure token storage
- Password hashing with bcrypt
- Rate limiting (60 requests/minute per IP)
- CORS configuration for allowed origins
- SQL injection protection via SQLAlchemy ORM
- Input validation with Pydantic schemas
- Environment-based configuration (no hardcoded secrets)

---

## 📊 Data Sources

- **[FastF1](https://github.com/theOehrly/Fast-F1)** - Official F1 timing data and telemetry
- **[Jolpica F1 API](https://github.com/jolpica/jolpica-f1)** - Historical F1 data (Ergast successor)

---

## 🤝 Contributing

Contributions are welcome! Please check out the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FastF1** - Excellent Python library for F1 telemetry data
- **Jolpica F1 API** - Comprehensive historical F1 data
- **Shadcn/ui** - Beautiful and accessible UI components
- **Formula 1** - For the amazing sport and data availability

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review the [SETUP.md](SETUP.md) for detailed setup instructions

---

<div align="center">

**PyPole** - Professional Formula 1 Analytics 🏁

Made with ❤️ for F1 fans and data enthusiasts

</div>
