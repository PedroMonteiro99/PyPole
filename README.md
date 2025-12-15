# PyPole - Formula 1 Full-Stack Analytics Platform

Uma aplicação completa de análise de dados da Fórmula 1, construída com FastAPI (backend) e Next.js 16 (frontend).

## 🏎️ Funcionalidades

### Backend
- **FastAPI** com Python 3.11+
- **PostgreSQL** para armazenamento de dados
- **Redis** para cache de APIs externas
- **FastF1** para dados detalhados de telemetria e voltas
- **Jolpica F1 API** para classificações e calendário
- **JWT Authentication** para segurança
- **Rate Limiting** (60 req/min por IP)
- **Logging estruturado** com structlog

### Frontend
- **Next.js 15** com App Router
- **TypeScript** strict mode
- **Shadcn/ui** para componentes UI
- **TanStack Query** para gerenciamento de estado
- **Recharts** para gráficos interativos
- **Dark/Light Mode** com next-themes
- **Responsive Design** mobile-first

## 📊 Recursos da Aplicação

### Dashboard
- Próxima corrida
- Líder do campeonato
- Top 5 pilotos

### Calendário
- Calendário completo da temporada
- Detalhes de cada corrida
- Localização e data

### Classificações
- Classificação de pilotos
- Classificação de construtores
- Pontos e vitórias
- Cores das equipes

### Análise de Corrida
- Gráficos de tempos por volta
- Estratégia de pneus
- Comparação entre pilotos
- Seleção de sessão (FP1, FP2, FP3, Q, S, R)

### Configurações
- Toggle de tema (dark/light)
- Equipe favorita
- Piloto favorito

## 🚀 Instalação

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Poetry (para backend)
- npm ou yarn (para frontend)

### Setup do Backend

```bash
cd backend

# Instalar dependências
poetry install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações

# Iniciar PostgreSQL e Redis
docker-compose up -d postgres redis

# Executar migrações
poetry run alembic upgrade head

# Iniciar servidor
poetry run uvicorn app.main:app --reload
```

O backend estará disponível em: http://localhost:8000

### Setup do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Editar .env.local com a URL do backend

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:3000

### Docker Compose (Recomendado)

Para iniciar toda a stack de uma vez:

```bash
docker-compose up --build
```

Isso iniciará:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- Backend API (porta 8000)

## 📁 Estrutura do Projeto

```
PyPole/
├── backend/
│   ├── app/
│   │   ├── api/          # Endpoints da API
│   │   ├── core/         # Configuração e segurança
│   │   ├── db/           # Modelos e sessão do banco
│   │   ├── schemas/      # Schemas Pydantic
│   │   ├── services/     # Serviços externos (FastF1, Jolpica)
│   │   └── utils/        # Utilitários (cache, etc)
│   ├── alembic/          # Migrações de banco
│   ├── pyproject.toml    # Dependências Poetry
│   └── Dockerfile
├── frontend/
│   ├── app/              # Páginas Next.js
│   ├── components/       # Componentes React
│   ├── lib/              # Utilitários e types
│   ├── hooks/            # Custom hooks
│   ├── providers/        # Context providers
│   └── package.json
└── docker-compose.yml
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Obter usuário atual
- `PUT /api/v1/auth/me` - Atualizar usuário
- `PUT /api/v1/auth/preferences` - Atualizar preferências

### Jolpica (Dados Gerais)
- `GET /api/v1/jolpica/schedule/current` - Calendário atual
- `GET /api/v1/jolpica/schedule/{season}` - Calendário da temporada
- `GET /api/v1/jolpica/schedule/next` - Próxima corrida
- `GET /api/v1/jolpica/standings/drivers` - Classificação de pilotos
- `GET /api/v1/jolpica/standings/constructors` - Classificação de construtores
- `GET /api/v1/jolpica/results/{season}/{round}` - Resultados

### FastF1 (Dados Detalhados)
- `GET /api/v1/fastf1/race/{year}/{race}/laps` - Tempos por volta
- `GET /api/v1/fastf1/race/{year}/{race}/driver/{driver}/laps` - Voltas do piloto
- `GET /api/v1/fastf1/race/{year}/{race}/telemetry` - Dados de telemetria
- `GET /api/v1/fastf1/race/{year}/{race}/stints` - Estratégias de pneus
- `GET /api/v1/fastf1/race/{year}/{race}/fastest-lap` - Volta mais rápida

## 🎨 Tecnologias Utilizadas

### Backend
- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- Redis
- FastF1
- Jolpica F1
- Pydantic
- Alembic
- Structlog
- SlowAPI (rate limiting)

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/ui
- TanStack Query
- Recharts
- next-themes
- Axios
- date-fns

## 📝 Estratégia de Cache

- **Dados Jolpica**: 15 minutos (dados que mudam frequentemente)
- **Dados FastF1**: 24 horas (dados históricos não mudam)

### Chaves de Cache
- `jolpica:schedule:{season}`
- `jolpica:standings:drivers:{season}`
- `jolpica:standings:constructors:{season}`
- `fastf1:laps:{year}:{race}:{session_type}`
- `fastf1:telemetry:{year}:{race}:{session_type}:{driver}:{lap}`
- `fastf1:stints:{year}:{race}:{session_type}`

## 🧪 Desenvolvimento

### Backend

```bash
# Testes
poetry run pytest

# Formatação
poetry run black .

# Linting
poetry run ruff .

# Type checking
poetry run mypy .

# Nova migração
poetry run alembic revision --autogenerate -m "description"

# Aplicar migrações
poetry run alembic upgrade head
```

### Frontend

```bash
# Build de produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

## 🌐 Deploy

### Backend
1. Configure as variáveis de ambiente de produção
2. Execute `poetry install --no-dev`
3. Execute as migrações: `alembic upgrade head`
4. Inicie com: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Frontend
1. Configure `NEXT_PUBLIC_API_URL` para a URL do backend em produção
2. Execute `npm run build`
3. Faça deploy para Vercel, Netlify, ou qualquer plataforma Node.js

## 📄 Licença

Este projeto foi criado para fins educacionais e demonstração.

## 🙏 Créditos

- **FastF1**: Biblioteca Python para dados de telemetria F1
- **Jolpica F1 API**: API para dados históricos da F1
- **Shadcn/ui**: Componentes UI reutilizáveis
- **Ergast API**: Dados históricos (via Jolpica)

## 📞 Suporte

Para problemas ou sugestões, abra uma issue no repositório.

---

**PyPole** - Análise de dados da Fórmula 1 de forma profissional 🏁
