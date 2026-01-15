---
description: Discover existing patterns and populate the Seed Vault (run once after install)
allowed-tools: Read,Write,Glob,Grep,Bash(find:*),Bash(ls:*),Bash(cat:*),Bash(grep:*),Bash(git add:*),Bash(git commit:*),Task
argument-hint: [--mode seeding|growth]
---

# Keeper Plant Seeds

You are the **Keeper of the Seeds** performing initial discovery of existing patterns.

This command scans the codebase and populates the Seed Vault with what already exists.
Run this once after installing Keeper on a rig.

**Arguments**: $ARGUMENTS

## Step 1: Determine Codebase Location

Find the source code root:
```bash
ls -d src/ app/ lib/ packages/ 2>/dev/null | head -1
```

If not found, use current directory.

## Step 2: Set Discovery Mode

If `--mode` specified in arguments, note it. Otherwise default to `seeding` for new discovery.

## Step 3: Launch Parallel Discovery Agents

**CRITICAL**: To handle large codebases without context overflow, you MUST spawn 6 parallel
sub-agents using the Task tool. Each agent discovers patterns for one seed category.

Launch ALL of these agents in a SINGLE message with multiple Task tool calls:

### Agent 1: Frontend Discovery
```
Use Task tool with subagent_type="Explore" and prompt:
"Discover frontend patterns in this codebase for the Keeper Seed Vault.

Find and document:
1. **Components**: React/Vue/Svelte components in ui/, components/, shared/ directories
   - Component names, variants, props, locations
2. **Hooks**: Custom hooks (use*.ts files)
   - Hook names, purpose, return types
3. **State Stores**: Redux slices, Zustand stores, Context providers
   - Store names, what state they manage
4. **i18n Keys**: Translation key namespaces and locations
5. **Design Tokens**: Theme files, CSS variables, Tailwind config

Output as YAML format matching keeper/seeds/frontend.yaml structure.
Only report what you actually find - do not invent patterns."
```

### Agent 2: Backend Discovery
```
Use Task tool with subagent_type="Explore" and prompt:
"Discover backend patterns in this codebase for the Keeper Seed Vault.

Find and document:
1. **API Routes**: REST endpoints (Express/Fastify/Next.js API routes)
   - HTTP method, path, auth requirements
2. **Services**: Service classes/modules
   - Names, responsibilities, boundaries
3. **Error Types**: Error codes, error classes, error handling patterns
4. **Logging Patterns**: Structured logging, log levels, log formats
5. **Event Schemas**: Domain events, message queues, pub/sub patterns

Output as YAML format matching keeper/seeds/backend.yaml structure.
Only report what you actually find - do not invent patterns."
```

### Agent 3: Data Discovery
```
Use Task tool with subagent_type="Explore" and prompt:
"Discover data patterns in this codebase for the Keeper Seed Vault.

Find and document:
1. **Tables**: Database tables (Prisma, TypeORM, Drizzle, SQL migrations)
   - Table names, primary keys, indexes, constraints
2. **Enums**: TypeScript enums, string literal unions, database enums
   - Enum names, values, scope
3. **Validation Schemas**: Zod/Yup/Joi schemas
   - Schema names, what they validate
4. **Type Aliases**: Shared TypeScript types
   - Type names, definitions, usage

Output as YAML format matching keeper/seeds/data.yaml structure.
Only report what you actually find - do not invent patterns."
```

### Agent 4: Auth Discovery
```
Use Task tool with subagent_type="Explore" and prompt:
"Discover auth patterns in this codebase for the Keeper Seed Vault.

Find and document:
1. **Auth Model**: JWT, session, OAuth configuration
   - Token types, storage, expiry
2. **Scopes**: Permission scopes defined
   - Scope names, what they permit, role grants
3. **Roles**: Role definitions and hierarchy
   - Role names, inheritance
4. **Token Shape**: Required and forbidden claims
5. **Middleware**: Auth middleware patterns

Output as YAML format matching keeper/seeds/auth.yaml structure.
Only report what you actually find - do not invent patterns."
```

### Agent 5: Config Discovery
```
Use Task tool with subagent_type="Explore" and prompt:
"Discover configuration patterns in this codebase for the Keeper Seed Vault.

Find and document:
1. **Feature Flags**: Feature flag systems, flag definitions
   - Flag names, default values, rollout strategies
2. **Environment Variables**: Required env vars (.env files, config loaders)
   - Var names, required/optional, sensitivity
3. **Config Files**: Configuration file patterns
   - Formats, locations, schemas

Output as YAML format matching keeper/seeds/config.yaml structure.
Only report what you actually find - do not invent patterns."
```

### Agent 6: Testing Discovery
```
Use Task tool with subagent_type="Explore" and prompt:
"Discover testing patterns in this codebase for the Keeper Seed Vault.

Find and document:
1. **Test Fixtures**: Data factories, fixture files
   - Fixture names, what they create, variants
2. **Mock Services**: Service mocks, test doubles
   - Mock names, what they mock
3. **Test Utilities**: Shared test helpers
   - Utility names, purposes
4. **Test Structure**: Test organization patterns
   - Unit/integration/e2e locations, naming conventions
5. **Coverage Config**: Coverage thresholds if defined

Output as YAML format matching keeper/seeds/testing.yaml structure.
Only report what you actually find - do not invent patterns."
```

## Step 4: Collect and Merge Results

After all 6 agents complete, collect their outputs and merge into the seed files:

1. Read each agent's output
2. Parse the YAML discoveries
3. Merge with existing templates in `keeper/seeds/`
4. Write updated seed files

For each seed file:
- Preserve the template structure and comments
- Add discovered patterns in the appropriate sections
- Mark discovered items with `# discovered` comment

## Step 5: Generate Discovery Report

Output a summary:

```
KEEPER PLANT SEEDS: COMPLETE

Discovered Patterns:
  Frontend:
    - Components: <count>
    - Hooks: <count>
    - State stores: <count>
    - i18n namespaces: <count>
    - Design tokens: <found|not found>

  Backend:
    - API Routes: <count>
    - Services: <count>
    - Error types: <count>
    - Logging patterns: <found|not found>
    - Event schemas: <count>

  Data:
    - Tables: <count>
    - Enums: <count>
    - Validation schemas: <count>
    - Type aliases: <count>

  Auth:
    - Auth type: <jwt|session|oauth|none>
    - Scopes: <count>
    - Roles: <count>

  Config:
    - Feature flags: <count>
    - Environment vars: <count>
    - Config files: <count>

  Testing:
    - Test fixtures: <count>
    - Mock services: <count>
    - Test utilities: <count>

Seed Vault populated at: keeper/seeds/

Mode set to: <seeding|growth>

Next steps:
1. Review keeper/seeds/*.yaml for accuracy
2. Add any patterns that weren't auto-discovered
3. Set forbidden_extensions for each component
4. Run /keeper-review on your first spec
```

## Step 6: Commit the Seeds

**CRITICAL**: Discovered seeds MUST be committed to avoid data loss during worktree operations.

```bash
git add keeper/seeds/*.yaml keeper/keeper.yaml
git commit -m "chore(keeper): plant seeds - initial discovery

Discovered patterns via /keeper-plant.
Review and refine as needed."
```

If the commit fails (e.g., no changes or git issues), warn the user:
```
⚠️  WARNING: Seeds were written but NOT committed.
Run: git add keeper/seeds/*.yaml && git commit -m "plant seeds"
Uncommitted seeds may be lost during worktree operations.
```

## Important Notes

- **Parallel execution is required** - Do NOT run discovery sequentially
- **Seeds must be committed** - Uncommitted seeds are lost when worktrees change
- This is a **best-effort discovery** - manual review is required
- Some patterns may be missed or misidentified
- Add `when_to_use` descriptions manually for clarity
- Set `forbidden_extensions` based on team conventions
- Discovery doesn't replace understanding your own codebase
