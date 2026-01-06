# PyPole - Índice de Documentação 📚

Bem-vindo à documentação completa do PyPole! Este índice organiza toda a documentação disponível.

## 🚀 Começando

### Instalação e Setup

- **[README.md](README.md)** - Visão geral do projeto e features
- **[SETUP.md](SETUP.md)** - Guia detalhado de configuração
- **[QUICKSTART.sh](QUICKSTART.sh)** - Script de início rápido

### Primeiros Passos

1. Leia o [README.md](README.md) para entender o projeto
2. Siga o [SETUP.md](SETUP.md) para configurar o ambiente
3. Execute o [QUICKSTART.sh](QUICKSTART.sh) ou use Docker Compose
4. Acesse http://localhost:3000 e explore!

## 📖 Documentação Principal

### Arquitetura e Design

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura completa da aplicação
  - Visão geral do sistema
  - Componentes e camadas
  - Fluxo de dados
  - Estratégias de cache
  - Integração com APIs externas
  - Performance e escalabilidade
  - Segurança

### Stack Tecnológica

- **[TECH_STACK.md](TECH_STACK.md)** - Tecnologias utilizadas
  - Frontend (Next.js, React, TypeScript)
  - Backend (FastAPI, Python, PostgreSQL)
  - Infrastructure (Docker, Redis)
  - Deployment recommendations
  - Ferramentas de desenvolvimento

## 🔧 Documentação por Componente

### Backend

- **[backend/README.md](backend/README.md)** - Documentação específica do backend
  - Setup do backend
  - API endpoints
  - Estrutura de código
  - Migrações de banco
  - Testes
  - Cache strategy

### Frontend

- **[frontend/README.md](frontend/README.md)** - Documentação específica do frontend
  - Setup do frontend
  - Estrutura de componentes
  - Hooks customizados
  - Styling e temas
  - Deployment

## 🤝 Contribuindo

### Guias de Contribuição

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Como contribuir
  - Reportando bugs
  - Sugerindo features
  - Processo de Pull Request
  - Guia de estilo (Python & TypeScript)
  - Convenção de commits
  - Code review

## 📊 APIs e Integrações

### API Documentation

- **Swagger UI**: http://localhost:8000/docs (quando rodando)
- **ReDoc**: http://localhost:8000/redoc (quando rodando)
- **OpenAPI Schema**: http://localhost:8000/api/v1/openapi.json

### Endpoints Principais

#### Autenticação

```
POST   /api/v1/auth/register      - Registrar usuário
POST   /api/v1/auth/login         - Login
GET    /api/v1/auth/me            - Dados do usuário
PUT    /api/v1/auth/me            - Atualizar usuário
PUT    /api/v1/auth/preferences   - Atualizar preferências
```

#### Jolpica (Dados Gerais)

```
GET    /api/v1/jolpica/schedule/current         - Calendário atual
GET    /api/v1/jolpica/schedule/{season}        - Calendário da temporada
GET    /api/v1/jolpica/schedule/next            - Próxima corrida
GET    /api/v1/jolpica/standings/drivers        - Classificação pilotos
GET    /api/v1/jolpica/standings/constructors   - Classificação equipes
GET    /api/v1/jolpica/results/{season}/{round} - Resultados
```

#### FastF1 (Análise Detalhada)

```
GET    /api/v1/fastf1/race/{year}/{race}/laps              - Tempos por volta
GET    /api/v1/fastf1/race/{year}/{race}/driver/{driver}/laps - Voltas do piloto
GET    /api/v1/fastf1/race/{year}/{race}/telemetry         - Telemetria
GET    /api/v1/fastf1/race/{year}/{race}/stints            - Estratégias de pneus
GET    /api/v1/fastf1/race/{year}/{race}/fastest-lap       - Volta mais rápida
```

## 🎯 Guias por Tarefa

### Desenvolvimento

#### Adicionar Nova Feature

1. Leia [CONTRIBUTING.md](CONTRIBUTING.md)
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Implemente seguindo [ARCHITECTURE.md](ARCHITECTURE.md)
4. Adicione testes
5. Abra Pull Request

#### Debugar Problemas

1. Verifique logs: `docker-compose logs -f`
2. Consulte [SETUP.md](SETUP.md) - Troubleshooting
3. Verifique [ARCHITECTURE.md](ARCHITECTURE.md) - Fluxo de dados
4. Use DevTools do browser e API docs

#### Fazer Deploy

1. Siga [CHECKLIST.md](CHECKLIST.md) - Checklist de Deploy
2. Configure variáveis de ambiente
3. Execute build de produção
4. Teste em staging antes de produção

### Uso da Aplicação

#### Como Usuário

1. Registre uma conta em `/register`
2. Faça login em `/login`
3. Explore o Dashboard (home)
4. Veja calendário em `/schedule`
5. Consulte classificações em `/standings`
6. Analise corridas em `/race`
7. Configure preferências em `/settings`

#### Como Desenvolvedor

1. Explore Swagger UI em http://localhost:8000/docs
2. Teste endpoints com Postman/Insomnia
3. Use React Query DevTools no frontend
4. Monitore logs estruturados do backend

## 📁 Estrutura de Arquivos

```
PyPole/
├── 📚 Documentação Raiz
│   ├── README.md              - Overview do projeto
│   ├── SETUP.md              - Guia de setup
│   ├── ARCHITECTURE.md       - Arquitetura
│   ├── TECH_STACK.md        - Stack tecnológica
│   ├── CONTRIBUTING.md      - Guia de contribuição
│   ├── CHECKLIST.md         - Status de implementação
│   ├── DOCS_INDEX.md        - Este arquivo
│   └── QUICKSTART.sh        - Script de início
│
├── 🔧 Backend
│   ├── backend/README.md    - Docs do backend
│   ├── app/                 - Código fonte
│   ├── tests/               - Testes
│   └── alembic/            - Migrações
│
├── ⚛️  Frontend
│   ├── frontend/README.md   - Docs do frontend
│   ├── app/                 - Páginas Next.js
│   ├── components/          - Componentes React
│   ├── lib/                 - Utilitários
│   └── hooks/              - Custom hooks
│
└── 🐳 Infrastructure
    ├── docker-compose.yml   - Orquestração
    ├── Dockerfile          - Backend image
    └── .gitignore         - Git ignore
```

## 🔗 Links Externos

### Documentação de Dependências

#### Frontend

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Recharts](https://recharts.org/en-US/api)

#### Backend

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Python Docs](https://docs.python.org/3/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/en/20/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [Redis Docs](https://redis.io/docs/)

#### F1 Data Sources

- [FastF1 Documentation](https://docs.fastf1.dev/)
- [Jolpica F1 API](https://github.com/jolpica/jolpica-f1)
- [Ergast API](http://ergast.com/mrd/)

## 🎓 Tutoriais e Exemplos

### Exemplos de Uso

#### Buscar Próxima Corrida

```typescript
// Frontend
import { useNextRace } from "@/hooks/useNextRace";

const { data, isLoading } = useNextRace();
console.log(data?.race);
```

```python
# Backend
from app.services.jolpica_service import jolpica_service

next_race = await jolpica_service.get_next_race()
```

#### Adicionar Novo Endpoint

Ver [CONTRIBUTING.md](CONTRIBUTING.md) - Seção "Adicionar Nova Feature"

#### Criar Nova Migração

```bash
cd backend
poetry run alembic revision --autogenerate -m "Add new table"
poetry run alembic upgrade head
```

## 🐛 Troubleshooting

### Problemas Comuns

Consulte [SETUP.md](SETUP.md) - Seção "Troubleshooting" para:

- Connection refused (PostgreSQL/Redis)
- Frontend não conecta ao backend
- FastF1 data not loading
- CORS errors

## 📊 Métricas do Projeto

- **Total de Arquivos**: 80+
- **Linhas de Código**: ~3500+
- **Componentes React**: 15+
- **API Endpoints**: 20+
- **Páginas**: 6
- **Testes**: Estrutura criada
- **Documentação**: 10+ arquivos

## ✅ Status do Projeto

| Fase           | Status | Documentação |
| -------------- | ------ | ------------ |
| Fase 1: Setup  | ✅     | CHECKLIST.md |
| Fase 2: Dados  | ✅     | CHECKLIST.md |
| Fase 3: Auth   | ✅     | CHECKLIST.md |
| Fase 4: FastF1 | ✅     | CHECKLIST.md |
| Fase 5: Polish | ✅     | CHECKLIST.md |
| Deploy         | 🔜     | CHECKLIST.md |

## 🚀 Próximos Passos

1. **Para novos usuários**: Leia [README.md](README.md) e execute [QUICKSTART.sh](QUICKSTART.sh)
2. **Para desenvolvedores**: Leia [ARCHITECTURE.md](ARCHITECTURE.md) e [CONTRIBUTING.md](CONTRIBUTING.md)
3. **Para deploy**: Siga [CHECKLIST.md](CHECKLIST.md) - Seção "Checklist de Deploy"
4. **Para entender o stack**: Leia [TECH_STACK.md](TECH_STACK.md)

## 📞 Suporte

- **Issues**: Para bugs e features
- **Discussions**: Para perguntas
- **Pull Requests**: Para contribuições

## 📝 Changelog

Versão 1.0.0 (Dezembro 2024):

- ✅ Implementação completa de todas as 8 fases
- ✅ Backend FastAPI com PostgreSQL e Redis
- ✅ Frontend Next.js 15 com TypeScript
- ✅ Integração FastF1 e Jolpica
- ✅ Sistema de autenticação JWT
- ✅ Documentação completa
- ✅ Docker Compose configurado

---

**Última atualização**: Dezembro 2024  
**Versão da Documentação**: 1.0.0  
**Status**: ✅ Completo e pronto para uso

**Dúvidas?** Consulte a documentação apropriada acima ou abra uma issue! 🏁
