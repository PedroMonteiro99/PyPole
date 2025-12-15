# PyPole - Arquitetura da Aplicação

## 🏗️ Visão Geral

PyPole é uma aplicação full-stack para análise de dados da Fórmula 1, seguindo uma arquitetura em camadas com separação clara entre frontend e backend.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js 15 + TypeScript + Shadcn/ui + TanStack Query      │
│                      (Port 3000)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                        Backend API                           │
│         FastAPI + SQLAlchemy + Redis Cache                  │
│                      (Port 8000)                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│   PostgreSQL     │                  │      Redis       │
│   (Port 5432)    │                  │   (Port 6379)    │
│   User Data      │                  │   API Cache      │
└──────────────────┘                  └──────────────────┘
        
                    External Data Sources
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  Jolpica F1 API  │                  │     FastF1       │
│  Schedule        │                  │   Telemetry      │
│  Standings       │                  │   Lap Times      │
└──────────────────┘                  └──────────────────┘
```

## 📦 Componentes Principais

### Frontend (Next.js)

#### Estrutura de Pastas

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raiz com providers
│   ├── page.tsx           # Dashboard (home)
│   ├── schedule/          # Calendário de corridas
│   ├── standings/         # Classificações
│   ├── race/              # Análise de corrida
│   ├── settings/          # Configurações
│   ├── login/             # Autenticação
│   └── register/          # Registro de usuário
│
├── components/            # Componentes React
│   ├── ui/               # Shadcn UI components
│   ├── Sidebar.tsx       # Navegação lateral
│   ├── RaceCard.tsx      # Card de corrida
│   ├── StandingsTable.tsx # Tabela de classificação
│   ├── LapTimeChart.tsx  # Gráfico de tempos
│   └── ThemeToggle.tsx   # Toggle dark/light
│
├── lib/                   # Utilitários
│   ├── api.ts            # Cliente HTTP (axios)
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # Funções auxiliares
│   └── auth.ts           # Configuração NextAuth
│
├── hooks/                 # Custom React Hooks
│   ├── useNextRace.ts    # Hook para próxima corrida
│   └── useStandings.ts   # Hook para classificações
│
└── providers/             # Context Providers
    ├── ThemeProvider.tsx  # Tema dark/light
    └── ReactQueryProvider.tsx # TanStack Query
```

#### Fluxo de Dados

1. **Componente** solicita dados via **hook** (React Query)
2. **Hook** faz requisição HTTP via **api.ts** (axios)
3. **TanStack Query** gerencia cache e estados (loading, error, success)
4. **Componente** renderiza dados ou estados de loading/error

#### State Management

- **TanStack Query**: Cache de dados do servidor, refetch automático
- **React State**: Estado local de componentes
- **LocalStorage**: Token JWT para autenticação

### Backend (FastAPI)

#### Estrutura de Pastas

```
backend/
├── app/
│   ├── api/                    # Endpoints REST
│   │   ├── deps.py            # Dependências (auth, db)
│   │   └── v1/                # API versão 1
│   │       ├── auth.py        # Autenticação
│   │       ├── jolpica.py     # Endpoints Jolpica
│   │       └── fastf1.py      # Endpoints FastF1
│   │
│   ├── core/                   # Configuração central
│   │   ├── config.py          # Settings (Pydantic)
│   │   └── security.py        # JWT, passwords
│   │
│   ├── db/                     # Database
│   │   ├── base.py            # Base declarativa
│   │   ├── session.py         # AsyncSession factory
│   │   └── models.py          # SQLAlchemy models
│   │
│   ├── schemas/                # Pydantic schemas
│   │   └── user.py            # User DTOs
│   │
│   ├── services/               # Serviços externos
│   │   ├── jolpica_service.py # Cliente Jolpica API
│   │   └── fastf1_service.py  # Cliente FastF1
│   │
│   └── utils/                  # Utilitários
│       └── cache.py           # Redis cache utilities
│
└── alembic/                    # Migrations
    └── versions/              # Migration files
```

#### Camadas da Aplicação

1. **API Layer** (`api/`): Endpoints REST, validação de entrada
2. **Service Layer** (`services/`): Lógica de negócio, integração com APIs externas
3. **Data Layer** (`db/`): Acesso ao banco de dados
4. **Core Layer** (`core/`): Configuração, segurança, utilitários

#### Fluxo de Requisição

```
Request → Middleware → Route → Dependency → Service → External API/DB → Response
                                   ↓
                              Cache Layer (Redis)
```

## 🔐 Autenticação e Autorização

### Fluxo de Autenticação

1. **Registro**:
   ```
   User → POST /auth/register → Validate → Hash Password → Save to DB → Auto Login
   ```

2. **Login**:
   ```
   User → POST /auth/login → Validate Credentials → Generate JWT → Return Token
   ```

3. **Requisições Autenticadas**:
   ```
   User → Request + JWT Header → Validate Token → Get User → Execute Request
   ```

### Segurança

- **Passwords**: Hashed com bcrypt
- **JWT Tokens**: Assinados com HS256
- **Rate Limiting**: 60 req/min por IP
- **CORS**: Configurado para localhost (desenvolvimento)

## 💾 Estratégia de Cache

### Cache em Duas Camadas

1. **Redis (Backend)**:
   - Jolpica API: 15 minutos TTL
   - FastF1 API: 24 horas TTL
   - Chaves organizadas por namespace: `jolpica:*`, `fastf1:*`

2. **TanStack Query (Frontend)**:
   - Cache em memória
   - Stale time: 1 minuto
   - Refetch automático em window focus desabilitado

### Invalidação de Cache

- **Automática**: Expiração por TTL
- **Manual**: Endpoints podem forçar invalidação se necessário

## 🔄 Integração com APIs Externas

### Jolpica F1 API

**Uso**: Dados gerais (schedule, standings, results)

**Arquitetura**:
```
Backend → JolpicaService → HTTP Client → Jolpica API
              ↓
         Redis Cache
```

**Endpoints Consumidos**:
- `GET /f1/{season}.json` - Calendário
- `GET /f1/{season}/driverStandings.json` - Classificação pilotos
- `GET /f1/{season}/constructorStandings.json` - Classificação equipes
- `GET /f1/{season}/{round}/results.json` - Resultados

### FastF1

**Uso**: Dados detalhados (telemetria, lap times, stints)

**Arquitetura**:
```
Backend → FastF1Service → FastF1 Library → F1 Data Files
              ↓
         Redis Cache
              ↓
      Thread Pool Executor (operações síncronas)
```

**Features**:
- Download e cache de dados de sessão
- Análise de tempos por volta
- Dados de telemetria (velocidade, throttle, brake, gear)
- Estratégias de pneus (stints)

## 📊 Banco de Dados

### Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    favorite_team VARCHAR,
    favorite_driver VARCHAR,
    theme VARCHAR DEFAULT 'dark',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Migrações

- **Alembic**: Gerenciamento de schema
- **AsyncPG**: Driver assíncrono para PostgreSQL
- **SQLAlchemy 2.0**: ORM com suporte async

## 🎨 Frontend Design System

### Tema

- **Base**: Tailwind CSS
- **Components**: Shadcn/ui
- **Cores**: F1 team colors customizadas
- **Modos**: Dark (padrão) e Light

### Team Colors

Cada equipe tem cores específicas definidas em `globals.css`:
- Red Bull: `#3671C6`
- Ferrari: `#E8002D`
- Mercedes: `#27F4D2`
- McLaren: `#FF8000`
- Etc.

### Tire Compounds

Cores dos compostos de pneu:
- Soft: Vermelho
- Medium: Amarelo
- Hard: Branco
- Intermediate: Verde
- Wet: Azul

## 🚀 Performance

### Backend

- **Async/Await**: Todas operações I/O são assíncronas
- **Connection Pooling**: PostgreSQL e Redis
- **Rate Limiting**: Proteção contra abuse
- **Caching**: Redis para dados externos

### Frontend

- **Server Components**: Next.js renderiza no servidor quando possível
- **Code Splitting**: Automatic com Next.js
- **Image Optimization**: Next.js Image component
- **React Query**: Deduplicação de requisições, cache inteligente

## 🔍 Monitoramento e Logs

### Backend

- **Structured Logging**: JSON logs com structlog
- **Log Levels**: INFO (default), DEBUG, ERROR
- **Log Context**: Request ID, user ID, timestamps

### Frontend

- **Console Logs**: Desenvolvimento
- **Error Boundaries**: Captura erros de React
- **React Query DevTools**: Debug de cache e queries

## 🧪 Testes

### Backend

```python
# Estrutura de testes
backend/app/tests/
├── __init__.py
├── test_main.py          # Testes de endpoints básicos
├── test_auth.py          # Testes de autenticação
├── test_services.py      # Testes de serviços
└── conftest.py           # Fixtures pytest
```

**Framework**: pytest + pytest-asyncio

### Frontend

```typescript
// Estrutura de testes (a implementar)
frontend/__tests__/
├── components/           # Testes de componentes
├── hooks/               # Testes de hooks
└── pages/               # Testes de páginas
```

**Framework**: Jest + React Testing Library

## 📈 Escalabilidade

### Horizontal Scaling

- **Backend**: Stateless, pode escalar horizontalmente
- **Database**: PostgreSQL com réplicas read-only
- **Redis**: Redis Cluster para alta disponibilidade
- **Frontend**: CDN para assets estáticos

### Vertical Scaling

- **Database**: Índices otimizados, query optimization
- **Backend**: Ajuste de workers Uvicorn
- **Redis**: Aumento de memória

## 🔒 Segurança

### OWASP Top 10

- ✅ **Injection**: Parametrized queries (SQLAlchemy)
- ✅ **Broken Authentication**: JWT tokens, bcrypt passwords
- ✅ **Sensitive Data Exposure**: HTTPS only em produção
- ✅ **XML External Entities**: Não usa XML
- ✅ **Broken Access Control**: Role-based auth
- ✅ **Security Misconfiguration**: Environment variables
- ✅ **XSS**: React escaping automático
- ✅ **Insecure Deserialization**: Pydantic validation
- ✅ **Components with Known Vulnerabilities**: Dependências atualizadas
- ✅ **Insufficient Logging**: Structured logging

## 🚢 Deploy

### Backend

**Opções**:
- Docker Container (Recomendado)
- Heroku
- AWS ECS/EKS
- Google Cloud Run
- DigitalOcean App Platform

### Frontend

**Opções**:
- Vercel (Recomendado para Next.js)
- Netlify
- AWS Amplify
- Cloudflare Pages

### Database

**Opções**:
- AWS RDS PostgreSQL
- Google Cloud SQL
- Heroku Postgres
- DigitalOcean Managed Databases

### Redis

**Opções**:
- AWS ElastiCache
- Redis Cloud
- DigitalOcean Managed Redis
- Heroku Redis

## 📚 Decisões de Arquitetura

### Por que FastAPI?

- Performance comparável a Node.js/Go
- Type hints e validação automática
- OpenAPI/Swagger automático
- Async/await nativo
- Grande ecosystem Python

### Por que Next.js?

- React framework com SSR/SSG
- File-based routing
- API routes (se necessário)
- Excelente DX (Developer Experience)
- Deploy fácil na Vercel

### Por que PostgreSQL?

- Relational data (users, preferences)
- ACID compliant
- JSON support para dados flexíveis
- Excelente performance
- Amplamente suportado

### Por que Redis?

- Cache extremamente rápido
- TTL automático
- Estruturas de dados ricas
- Pub/Sub para real-time (futuro)

### Por que TanStack Query?

- Cache inteligente
- Refetch automático
- Optimistic updates
- Deduplicação de requests
- DevTools excelentes

## 🔮 Roadmap Futuro

1. **Real-time Features**:
   - WebSockets para live timing
   - Server-Sent Events para updates

2. **Analytics**:
   - Comparação histórica de pilotos
   - Previsões com ML
   - Visualizações avançadas (3D circuit maps)

3. **Social Features**:
   - Comentários em corridas
   - Favoritos e watchlists
   - Compartilhamento social

4. **Mobile**:
   - Progressive Web App (PWA)
   - React Native app

5. **Performance**:
   - GraphQL para queries otimizadas
   - Edge caching com CDN
   - Background jobs com Celery

