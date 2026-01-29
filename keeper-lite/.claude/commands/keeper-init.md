---
description: Initialize Keeper Lite - create .keeper/ directory with seed templates
allowed-tools: Read,Write,Glob,Bash(mkdir:*),Bash(ls:*)
argument-hint: [--mode seeding|growth|conservation]
---

# Keeper Init

Initialize the Keeper Lite system for this project.

**Arguments**: $ARGUMENTS

## Step 1: Check for Existing Setup

```bash
ls -la .keeper/ 2>/dev/null
```

If `.keeper/` already exists with content:
- Warn: "Keeper is already initialized. Use --force to reinitialize (will overwrite config)."
- Stop unless `--force` in arguments.

## Step 2: Create Directory Structure

```bash
mkdir -p .keeper/seeds .keeper/decisions .keeper/recommendations
```

## Step 3: Determine Mode

Parse `--mode` from arguments. Default to `seeding` for new projects.

## Step 4: Create config.json

Write to `.keeper/config.json`:

```json
{
  "keeper": {
    "mode": "<mode>",
    "initialized": "<ISO date>",
    "version": "1.0.0"
  },
  "seed_vault": {
    "frontend": "seeds/frontend.yaml",
    "backend": "seeds/backend.yaml",
    "data": "seeds/data.yaml",
    "auth": "seeds/auth.yaml"
  },
  "decisions_dir": "decisions/"
}
```

## Step 5: Create Seed Templates

Create each seed file with starter structure:

### .keeper/seeds/frontend.yaml

```yaml
# Frontend Seed Registry
# Components, hooks, and design patterns approved for reuse

components:
  # ComponentName:
  #   variants: [list, of, variants]
  #   location: path/to/Component.tsx
  #   when_to_use: "When to use this component"
  #   forbidden_patterns:
  #     - patterns to avoid

hooks:
  # useHookName:
  #   location: path/to/useHook.ts
  #   purpose: "What this hook provides"
  #   forbidden_patterns:
  #     - patterns to avoid

state_stores:
  # storeName:
  #   type: redux|zustand|context
  #   location: path/to/store.ts
  #   purpose: "What state this manages"

design_tokens:
  # location: path/to/tokens
  # colors: {}
  # spacing: {}
```

### .keeper/seeds/backend.yaml

```yaml
# Backend Seed Registry
# API routes, services, and patterns approved for reuse

routes:
  # /api/resource:
  #   methods: [GET, POST, PUT, DELETE]
  #   auth: required|optional|none
  #   location: path/to/route.ts
  #   when_to_use: "When to use this route"

services:
  # ServiceName:
  #   location: path/to/Service.ts
  #   purpose: "What this service does"
  #   dependencies: [other services]

error_types:
  # ErrorName:
  #   code: ERROR_CODE
  #   http_status: 400
  #   when_to_use: "When to throw this error"

events:
  # EventName:
  #   schema: { key: type }
  #   when_to_emit: "When this event fires"
```

### .keeper/seeds/data.yaml

```yaml
# Data Seed Registry
# Types, enums, and schemas approved for reuse

enums:
  # EnumName:
  #   values: [VALUE_A, VALUE_B]
  #   location: path/to/enums.ts
  #   append_only: true
  #   when_to_use: "When to use this enum"

types:
  # TypeName:
  #   location: path/to/types.ts
  #   purpose: "What this type represents"

schemas:
  # SchemaName:
  #   library: zod|yup|joi
  #   location: path/to/schema.ts
  #   validates: "What this schema validates"

tables:
  # table_name:
  #   location: path/to/schema (prisma/drizzle/etc)
  #   purpose: "What this table stores"
```

### .keeper/seeds/auth.yaml

```yaml
# Auth Seed Registry
# Authentication and authorization patterns

auth_model:
  type: jwt|session|oauth
  location: path/to/auth
  # token_shape:
  #   required_claims: [sub, iat, exp]
  #   forbidden_claims: []

scopes:
  # scope_name:
  #   grants: "What this scope allows"
  #   required_for: [list of routes/features]

roles:
  # role_name:
  #   scopes: [list of scopes]
  #   inherits_from: parent_role (optional)

middleware:
  # middleware_name:
  #   location: path/to/middleware.ts
  #   purpose: "What this middleware does"
```

## Step 6: Report Success

Output:

```
KEEPER LITE: INITIALIZED

Mode: <mode>
Location: .keeper/

Created:
  .keeper/config.json
  .keeper/seeds/frontend.yaml
  .keeper/seeds/backend.yaml
  .keeper/seeds/data.yaml
  .keeper/seeds/auth.yaml
  .keeper/decisions/
  .keeper/recommendations/

Next steps:
1. Run /keeper-plant to discover existing patterns
2. Review and refine seed files
3. Run /keeper-review before implementing new features
```

## Notes

- This command is idempotent - safe to run multiple times with --force
- Seeds start empty - run /keeper-plant to populate
- Mode can be changed later by editing .keeper/config.json
