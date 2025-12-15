# PyPole - Guia de Configuração Rápida

## 🚀 Início Rápido

### Opção 1: Docker Compose (Recomendado)

1. **Clone o repositório** (se ainda não o fez)

2. **Configure as variáveis de ambiente:**

**Backend:**
```bash
cd backend
```

Crie o arquivo `.env` com o seguinte conteúdo:
```env
DATABASE_URL=postgresql+asyncpg://pypole:pypole_dev_password@localhost:5432/pypole_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production-123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
API_V1_PREFIX=/api/v1
PROJECT_NAME=PyPole - F1 Analytics
DEBUG=True
RATE_LIMIT_PER_MINUTE=60
JOLPICA_CACHE_TTL=900
FASTF1_CACHE_TTL=86400
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

**Frontend:**
```bash
cd ../frontend
```

Crie o arquivo `.env.local` com:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this
```

3. **Inicie todos os serviços:**

```bash
# Na raiz do projeto
docker-compose up --build
```

4. **Acesse:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Opção 2: Desenvolvimento Local

#### Backend

```bash
cd backend

# Instalar Poetry (se não tiver)
pip install poetry

# Instalar dependências
poetry install

# Copiar .env
cp .env.example .env

# Iniciar PostgreSQL e Redis
docker-compose up -d postgres redis

# Criar tabelas do banco
poetry run alembic upgrade head

# Iniciar servidor
poetry run uvicorn app.main:app --reload
```

Backend disponível em: http://localhost:8000

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar .env
cp .env.example .env.local

# Iniciar servidor
npm run dev
```

Frontend disponível em: http://localhost:3000

## 📝 Variáveis de Ambiente

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://pypole:pypole_dev_password@localhost:5432/pypole_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# NextAuth (opcional para autenticação futura)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## 🗄️ Banco de Dados

### Criar primeira migração

```bash
cd backend
poetry run alembic revision --autogenerate -m "Initial migration"
poetry run alembic upgrade head
```

### Criar usuário de teste (opcional)

Você pode usar a API para registrar um usuário:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpassword123"
  }'
```

## 🧪 Testar a API

### Endpoints públicos (não requerem autenticação)

```bash
# Próxima corrida
curl http://localhost:8000/api/v1/jolpica/schedule/next

# Classificação de pilotos
curl http://localhost:8000/api/v1/jolpica/standings/drivers

# Calendário atual
curl http://localhost:8000/api/v1/jolpica/schedule/current
```

### Endpoints protegidos (requerem token JWT)

1. **Login:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&password=testpassword123"
```

Isso retorna um token JWT.

2. **Usar o token:**

```bash
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📊 Dados de Exemplo

### FastF1 - Análise de corrida

```bash
# Tempos por volta - GP do Brasil 2024
curl "http://localhost:8000/api/v1/fastf1/race/2024/21/laps?session_type=R"

# Estratégia de pneus
curl "http://localhost:8000/api/v1/fastf1/race/2024/21/stints?session_type=R"

# Telemetria de um piloto específico (ex: Verstappen, volta 15)
curl "http://localhost:8000/api/v1/fastf1/race/2024/21/telemetry?driver=VER&lap=15&session_type=R"
```

## 🔧 Troubleshooting

### Erro: "Connection refused" ao conectar ao PostgreSQL

- Verifique se o PostgreSQL está rodando: `docker-compose ps`
- Reinicie os serviços: `docker-compose restart postgres`

### Erro: "Redis connection failed"

- Verifique se o Redis está rodando: `docker-compose ps`
- Reinicie o Redis: `docker-compose restart redis`

### Erro: "FastF1 data not loading"

- FastF1 pode ser lento na primeira vez (faz download de dados)
- Aguarde alguns segundos/minutos dependendo da conexão
- Os dados são cacheados após o primeiro download

### Frontend não conecta ao backend

- Verifique se `NEXT_PUBLIC_API_URL` está correto em `.env.local`
- Certifique-se de que o backend está rodando na porta 8000
- Verifique CORS no backend (arquivo `backend/app/core/config.py`)

## 📦 Comandos Úteis

### Backend

```bash
# Atualizar dependências
poetry update

# Adicionar nova dependência
poetry add nome-do-pacote

# Criar nova migração
poetry run alembic revision --autogenerate -m "descrição"

# Ver histórico de migrações
poetry run alembic history

# Rollback última migração
poetry run alembic downgrade -1

# Testes
poetry run pytest

# Formatação de código
poetry run black .
poetry run ruff .
```

### Frontend

```bash
# Build de produção
npm run build

# Verificar tipos
npm run type-check

# Limpar cache do Next.js
rm -rf .next

# Atualizar dependências
npm update
```

### Docker

```bash
# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Parar serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados do banco!)
docker-compose down -v

# Reconstruir imagens
docker-compose build --no-cache
```

## 🎯 Próximos Passos

1. **Explore a API Docs**: http://localhost:8000/docs
2. **Teste o frontend**: http://localhost:3000
3. **Crie um usuário** através da página de registro
4. **Explore as análises de corrida** com dados reais da F1

## 📚 Documentação

- Backend API: http://localhost:8000/docs
- FastF1 Docs: https://docs.fastf1.dev/
- Jolpica API: https://github.com/jolpica/jolpica-f1
- Next.js Docs: https://nextjs.org/docs
- Shadcn/ui: https://ui.shadcn.com/

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Certifique-se de que todas as portas estão livres (3000, 8000, 5432, 6379)
3. Reinicie os serviços: `docker-compose restart`
4. Em último caso: `docker-compose down -v && docker-compose up --build`

