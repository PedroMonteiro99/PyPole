---
applyTo: "**"
---

# GitHub Copilot Instructions Management Guide

This rule explains how to add or edit GitHub Copilot instruction files for this project in VS Code.

## Instruction File Structure

Every instruction file must follow this exact format:

````markdown
---
applyTo: "glob/pattern/**"
---

# Instruction Title

Main content explaining the rule with markdown formatting.

1. Step-by-step instructions
2. Code examples
3. Guidelines

Example:

```typescript
// ✅ Good
function goodExample() {
  // Correct implementation
}

// ❌ Bad
function badExample() {
  // Incorrect implementation
}
```
````

```

## File Organization

### Required Location

All instruction files **must** be placed in:

```

PROJECT_ROOT/.github/instructions/

```

### Directory Structure

```

PROJECT_ROOT/
├── .github/
│ └── instructions/
│ ├── your-rule-name.instructions.md
│ ├── another-rule.instructions.md
│ └── copilot-instructions.instructions.md
└── ...

````

### Naming Conventions

- Use **kebab-case** for all filenames
- Always use **.instructions.md** extension
- Make names **descriptive** of the rule's purpose
- Examples: `typescript-style.instructions.md`, `tailwind-styling.instructions.md`

## The `applyTo` Field

The `applyTo` frontmatter field controls when GitHub Copilot automatically loads the instruction file:

| Pattern | When it applies |
|---|---|
| `'**'` | All files in the workspace |
| `'**/*.{ts,tsx}'` | TypeScript files only |
| `'app/**'` | Files under the `app/` directory |
| `'backend/**'` | Files under the `backend/` directory |

## Content Guidelines

### Writing Effective Instructions

1. **Be specific and actionable** - Provide clear, unambiguous instructions
2. **Include code examples** - Show both good and bad practices
3. **Keep it focused** - One concern per file
4. **Add context** - Explain why the rule exists

### Code Examples Format

```typescript
// ✅ Good: Named parameters pattern
function processUser({ id, name }: { id: string; name: string }) {
  return { id, displayName: name };
}

// ❌ Bad: Positional parameters
function processUser(id: string, name: string) {
  return { id, displayName: name };
}
````

## Instruction Categories

Organize files by purpose:

- **Code Style**: `typescript-style.instructions.md`, `tailwind-styling.instructions.md`
- **Architecture**: `project-structure.instructions.md`
- **Tools & Libraries**: `tech-stack-dependencies.instructions.md`, `tools.instructions.md`
- **UI**: `ui-components.instructions.md`
- **Meta**: `copilot-instructions.instructions.md`, `self-improve.instructions.md`

## Instruction Creation Checklist

- [ ] File placed in `.github/instructions/` directory
- [ ] Filename uses kebab-case with `.instructions.md` extension
- [ ] Frontmatter contains only `applyTo` with a valid glob pattern
- [ ] Contains a clear title and sections
- [ ] Provides both good and bad code examples where relevant
- [ ] Focused on a single concern

## Maintenance

- **Review regularly** - Keep instructions up to date with codebase changes
- **Update examples** - Ensure code samples reflect current patterns
- **Cross-reference** - Link related rules together
- **Document changes** - Update rules when patterns evolve
