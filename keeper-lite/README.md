# Keeper Lite

A lightweight architectural governance plugin for Claude Code. Prevents architectural drift by enforcing reuse, consistency, and deliberate evolution.

**No dependencies. No git required. Just copy and use.**

## What is Keeper?

Keeper is a "conservative librarian" that reviews your feature plans before you implement them. It checks proposed changes against your documented patterns (the "Seed Vault") and either:

- **Approves** with constraints (use existing patterns)
- **Extends** existing patterns minimally
- **Rejects** if changes would cause drift

Think of it as architectural code review, but proactive.

## Quick Start

### Option 1: One-Line Install (Recommended)

```bash
# Install to current directory (auto-enforcement)
curl -fsSL https://raw.githubusercontent.com/jeremykalmus/keeper/main/keeper-lite/install.sh | bash

# Install with specific enforcement level
curl -fsSL ... | bash -s -- --enforcement auto ~/my-project      # Auto-enforce (default)
curl -fsSL ... | bash -s -- --enforcement reminder ~/my-project  # Suggest only
curl -fsSL ... | bash -s -- --enforcement off ~/my-project       # Manual only
```

#### Enforcement Levels

| Level | Behavior |
|-------|----------|
| `auto` | Claude automatically runs `/keeper-review` before implementing new features |
| `reminder` | Claude suggests running `/keeper-review` but doesn't block |
| `off` | Keeper only runs when you explicitly call `/keeper-*` commands |

To change enforcement later, edit `CLAUDE.md` and find `<!-- KEEPER_ENFORCEMENT: level -->`

### Option 2: Manual Install

Clone and copy:

```bash
git clone https://github.com/jeremykalmus/keeper.git
cd keeper

# Copy CLAUDE.md (or merge with existing)
cp keeper-lite/CLAUDE.md your-project/CLAUDE.md

# Copy commands
mkdir -p your-project/.claude/commands
cp keeper-lite/.claude/commands/*.md your-project/.claude/commands/
```

### 2. Initialize

In Claude Code, run:
```
/keeper-init --mode seeding
```

This creates:
```
your-project/
└── .keeper/
    ├── config.json
    ├── seeds/
    │   ├── frontend.yaml
    │   ├── backend.yaml
    │   ├── data.yaml
    │   └── auth.yaml
    ├── decisions/
    └── recommendations/
```

### 3. Plant Seeds

Scan your codebase for existing patterns:
```
/keeper-plant
```

Review `.keeper/seeds/*.yaml` and refine the discovered patterns.

### 4. Review Features

Before implementing a new feature:
```
/keeper-review Add user profile editing with avatar upload
```

Keeper produces a decision (approved/rejected) with specific constraints.

## Commands

| Command | Purpose |
|---------|---------|
| `/keeper-init` | Initialize `.keeper/` directory |
| `/keeper-plant` | Scan codebase, populate seeds |
| `/keeper-review <feature>` | Review feature against seeds |
| `/keeper-tend` | Check recent changes for undocumented patterns |

## Auto-Enforcement

When enforcement is set to `auto`, Claude will automatically run `/keeper-review` before implementing new features.

**Triggers Keeper review when you ask to:**
- "Add", "create", "implement", or "build" a new feature
- Create new components, hooks, routes, services, or types
- Add new API endpoints or database fields
- Implement functionality touching 3+ files

**Skips Keeper review for:**
- Bug fixes in existing code
- Small tweaks (styling, copy changes)
- Refactoring without new patterns
- Config, docs, comments
- One-off scripts

## Modes

Set in `.keeper/config.json`:

| Mode | When to Use | Behavior |
|------|-------------|----------|
| `seeding` | New project | Allow new patterns freely, record everything |
| `growth` | Active development | Reuse-first, extensions preferred, new patterns gated |
| `conservation` | Mature/stable | New patterns almost always rejected |

## Git-Free Operation

Keeper Lite works without git. The `/keeper-tend` command falls back to file modification times instead of git history.

Perfect for:
- OneDrive/Dropbox synced projects
- Corporate environments without git
- Quick prototypes

## Seed Files

Seeds are YAML files documenting your approved patterns:

### frontend.yaml
```yaml
components:
  Button:
    variants: [primary, secondary, danger]
    location: src/ui/Button.tsx
    when_to_use: "Any clickable action"
    forbidden_patterns:
      - custom colors outside design tokens
```

### backend.yaml
```yaml
routes:
  /api/users:
    methods: [GET, POST]
    auth: required
    location: src/api/users/route.ts
```

### data.yaml
```yaml
enums:
  UserStatus:
    values: [active, inactive, pending]
    append_only: true
```

### auth.yaml
```yaml
auth_model:
  type: jwt
  location: src/auth/jwt.ts
```

## Decision Format

Keeper produces decisions in `.keeper/decisions/`:

```yaml
keeper_decision:
  id: 003
  date: 2024-01-15
  feature: "User profile editing"
  status: approved

  reuse:
    frontend: [Button, Input, Modal]
    backend: [/api/users/:id]

  extensions:
    frontend:
      Input:
        add_variant: "file-upload"

  new_seeds:
    - type: component
      name: AvatarUploader
      justification: "No existing file upload component"

  forbidden:
    - Creating new modal for avatar crop (use existing Modal)
    - Custom colors for avatar border
```

## The Four Questions

Keeper asks these for every proposed element:

1. **What already exists?** - Check the Seed Vault
2. **Is it sufficient?** - Does it cover the use case?
3. **What is the smallest extension?** - Prefer extend over create
4. **How is a new seed preserved?** - Document for future reuse

## Key Principles

- **Prefer reuse over extension**
- **Prefer extension over creation**
- **Reject if uncertain**
- A pattern must appear **twice** before promotion to seed

## Differences from Full Keeper

| Aspect | Full Keeper (Gastown) | Keeper Lite |
|--------|----------------------|-------------|
| Orchestration | Beads + convoys | None |
| Git | Required | Optional |
| Sub-agents | 6 parallel | Single agent |
| Installation | Shell script | Copy files |
| Seeds format | YAML | YAML |
| Dependencies | gastown, beads | None |

## License

MIT
