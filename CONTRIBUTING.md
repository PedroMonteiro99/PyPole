# Contribuindo para PyPole

Obrigado por considerar contribuir para o PyPole! 🏎️

## 🤝 Como Contribuir

### Reportando Bugs

Se você encontrou um bug:

1. Verifique se o bug já não foi reportado nas [Issues](../../issues)
2. Abra uma nova issue com:
   - Título claro e descritivo
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots (se aplicável)
   - Ambiente (OS, Browser, versões)

### Sugerindo Features

Para sugerir uma nova feature:

1. Abra uma issue com tag `enhancement`
2. Descreva claramente a feature e o problema que ela resolve
3. Explique como ela funcionaria
4. Adicione exemplos de uso, se possível

### Pull Requests

1. **Fork** o repositório
2. **Clone** seu fork
3. Crie uma **branch** para sua feature/fix:
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/meu-fix
   ```

4. Faça suas alterações seguindo o guia de estilo

5. **Commit** suas mudanças:
   ```bash
   git commit -m "feat: adiciona nova feature X"
   # ou
   git commit -m "fix: corrige bug Y"
   ```

6. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```

7. Abra um **Pull Request**

## 📝 Guia de Estilo

### Backend (Python)

- Siga PEP 8
- Use type hints
- Docstrings para funções públicas
- Máximo 100 caracteres por linha
- Use formatação com `black`
- Use `ruff` para linting

```python
# Exemplo
async def get_race_data(year: int, round: int) -> Dict[str, Any]:
    """
    Get race data for a specific year and round.
    
    Args:
        year: The season year
        round: The race round number
        
    Returns:
        Dictionary with race data
    """
    # implementação
    pass
```

### Frontend (TypeScript)

- Use TypeScript strict mode
- Props tipadas em componentes
- Use `const` ao invés de `let` quando possível
- Preferir arrow functions
- Componentes funcionais com hooks
- ESLint + Prettier

```typescript
// Exemplo
interface RaceCardProps {
  race: Race;
  onSelect?: (race: Race) => void;
}

export function RaceCard({ race, onSelect }: RaceCardProps) {
  // implementação
}
```

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova feature
- `fix:` - Bug fix
- `docs:` - Documentação
- `style:` - Formatação (não afeta código)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

Exemplos:
```
feat: add driver comparison chart
fix: correct lap time calculation
docs: update installation instructions
style: format code with black
refactor: simplify cache logic
test: add tests for auth endpoints
chore: update dependencies
```

## 🧪 Testes

### Backend

```bash
cd backend
poetry run pytest
poetry run pytest --cov  # com coverage
```

Adicione testes para novas features:
```python
# backend/app/tests/test_feature.py
def test_nova_feature():
    # arrange
    # act
    # assert
    pass
```

### Frontend

```bash
cd frontend
npm test
npm run test:coverage  # com coverage
```

## 🏗️ Estrutura do Projeto

```
PyPole/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/     # Endpoints
│   │   ├── core/    # Config
│   │   ├── db/      # Database
│   │   ├── schemas/ # Pydantic
│   │   ├── services/# Business logic
│   │   └── utils/   # Utilities
│   └── tests/       # Tests
│
└── frontend/        # Next.js frontend
    ├── app/         # Pages
    ├── components/  # React components
    ├── lib/         # Utilities
    └── hooks/       # Custom hooks
```

## 🔍 Code Review

Ao revisar PRs, verificamos:

- [ ] Código segue o guia de estilo
- [ ] Testes foram adicionados
- [ ] Documentação foi atualizada
- [ ] Não há warnings de linter
- [ ] TypeScript/mypy sem erros
- [ ] Funcionalidade testada localmente
- [ ] Commits bem descritos

## 🚀 Processo de Release

1. Atualizar versão em `pyproject.toml` e `package.json`
2. Atualizar CHANGELOG.md
3. Criar tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions faz deploy automático

## 📚 Recursos

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [FastF1 Docs](https://docs.fastf1.dev/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

## 🎯 Areas que Precisam de Ajuda

- [ ] Testes (coverage < 80%)
- [ ] Documentação de APIs
- [ ] Exemplos de uso
- [ ] Performance optimization
- [ ] Acessibilidade
- [ ] Internacionalização (i18n)

## 💬 Comunicação

- Issues: Para bugs e features
- Discussions: Para perguntas e ideias
- Pull Requests: Para contribuições de código

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

## 🙏 Agradecimentos

Obrigado por contribuir para o PyPole! Toda ajuda é bem-vinda, seja código, documentação, testes, ou feedback.

---

**Dúvidas?** Abra uma issue ou discussion, estamos aqui para ajudar! 🏁

