---
description: Discover existing patterns and populate the Seed Vault (run once after install)
allowed-tools: Read,Write,Glob,Grep,Bash(find:*),Bash(ls:*),Bash(cat:*),Bash(grep:*),Bash(git add:*),Bash(git commit:*),Bash(git push:*),Task
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

**CRITICAL**: To handle large codebases without context overflow, spawn 6 parallel
sub-agents using the Task tool. Each agent:
1. Discovers patterns for one seed category
2. **Writes directly to the seed file** (do NOT return YAML to main agent)
3. Returns only a **brief summary** (counts)

This keeps discovery data in sub-agent context, not the main agent.

Launch ALL agents in a SINGLE message with multiple Task tool calls:

### Agent 1: Frontend Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper seed discovery agent for FRONTEND patterns.

TASK:
1. Read the template: keeper/seeds/frontend.yaml
2. Scan the codebase for frontend patterns:
   - Components: React/Vue/Svelte in ui/, components/, shared/
   - Hooks: Custom hooks (use*.ts files)
   - State Stores: Redux, Zustand, Context providers
   - i18n Keys: Translation namespaces
   - Design Tokens: Theme files, CSS variables, Tailwind config
3. WRITE your discoveries directly to keeper/seeds/frontend.yaml
   - Preserve template structure
   - Add discovered items with '# discovered' comment
4. Return ONLY a brief summary like:
   'Frontend: 12 components, 5 hooks, 2 stores, 0 i18n, 1 design tokens'

Do NOT return the full YAML - write it to the file directly.
Only report patterns you actually find - do not invent."
```

### Agent 2: Backend Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper seed discovery agent for BACKEND patterns.

TASK:
1. Read the template: keeper/seeds/backend.yaml
2. Scan the codebase for backend patterns:
   - API Routes: REST endpoints (Express/Fastify/Next.js)
   - Services: Service classes/modules
   - Error Types: Error codes, error classes
   - Logging Patterns: Structured logging patterns
   - Event Schemas: Domain events, message queues
3. WRITE your discoveries directly to keeper/seeds/backend.yaml
   - Preserve template structure
   - Add discovered items with '# discovered' comment
4. Return ONLY a brief summary like:
   'Backend: 8 routes, 4 services, 3 error types, logging found, 2 events'

Do NOT return the full YAML - write it to the file directly.
Only report patterns you actually find - do not invent."
```

### Agent 3: Data Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper seed discovery agent for DATA patterns.

TASK:
1. Read the template: keeper/seeds/data.yaml
2. Scan the codebase for data patterns:
   - Tables: Database tables (Prisma, TypeORM, Drizzle, SQL)
   - Enums: TypeScript enums, string unions, DB enums
   - Validation Schemas: Zod/Yup/Joi schemas
   - Type Aliases: Shared TypeScript types
3. WRITE your discoveries directly to keeper/seeds/data.yaml
   - Preserve template structure
   - Add discovered items with '# discovered' comment
4. Return ONLY a brief summary like:
   'Data: 10 tables, 7 enums, 4 schemas, 3 type aliases'

Do NOT return the full YAML - write it to the file directly.
Only report patterns you actually find - do not invent."
```

### Agent 4: Auth Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper seed discovery agent for AUTH patterns.

TASK:
1. Read the template: keeper/seeds/auth.yaml
2. Scan the codebase for auth patterns:
   - Auth Model: JWT, session, OAuth configuration
   - Scopes: Permission scopes defined
   - Roles: Role definitions and hierarchy
   - Token Shape: Required/forbidden claims
   - Middleware: Auth middleware patterns
3. WRITE your discoveries directly to keeper/seeds/auth.yaml
   - Preserve template structure
   - Add discovered items with '# discovered' comment
4. Return ONLY a brief summary like:
   'Auth: jwt model, 5 scopes, 3 roles, middleware found'

Do NOT return the full YAML - write it to the file directly.
Only report patterns you actually find - do not invent."
```

### Agent 5: Config Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper seed discovery agent for CONFIG patterns.

TASK:
1. Read the template: keeper/seeds/config.yaml
2. Scan the codebase for config patterns:
   - Feature Flags: Flag systems, flag definitions
   - Environment Variables: Required env vars
   - Config Files: Configuration file patterns
3. WRITE your discoveries directly to keeper/seeds/config.yaml
   - Preserve template structure
   - Add discovered items with '# discovered' comment
4. Return ONLY a brief summary like:
   'Config: 3 feature flags, 12 env vars, 2 config files'

Do NOT return the full YAML - write it to the file directly.
Only report patterns you actually find - do not invent."
```

### Agent 6: Testing Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper seed discovery agent for TESTING patterns.

TASK:
1. Read the template: keeper/seeds/testing.yaml
2. Scan the codebase for testing patterns:
   - Test Fixtures: Data factories, fixture files
   - Mock Services: Service mocks, test doubles
   - Test Utilities: Shared test helpers
   - Test Structure: Unit/integration/e2e organization
   - Coverage Config: Coverage thresholds
3. WRITE your discoveries directly to keeper/seeds/testing.yaml
   - Preserve template structure
   - Add discovered items with '# discovered' comment
4. Return ONLY a brief summary like:
   'Testing: 5 fixtures, 3 mocks, 4 utilities, coverage configured'

Do NOT return the full YAML - write it to the file directly.
Only report patterns you actually find - do not invent."
```

## Step 4: Generate Discovery Report

After all 6 agents complete, compile their **summaries** (not full YAML) into a report:

```
KEEPER PLANT SEEDS: COMPLETE

Discovered Patterns:
  Frontend: <agent 1 summary>
  Backend: <agent 2 summary>
  Data: <agent 3 summary>
  Auth: <agent 4 summary>
  Config: <agent 5 summary>
  Testing: <agent 6 summary>

Seed Vault populated at: keeper/seeds/

Mode set to: <seeding|growth>

Next steps:
1. Seeds committed and pushed (available to all agents)
2. Review keeper/seeds/*.yaml for accuracy
3. Add any patterns that weren't auto-discovered
4. Set forbidden_extensions for each component
5. Run /keeper-review on your first spec
```

## Step 5: Commit the Seeds

**CRITICAL**: Discovered seeds MUST be committed to avoid data loss during worktree operations.

```bash
git add keeper/seeds/*.yaml keeper/keeper.yaml
git commit -m "chore(keeper): plant seeds - initial discovery

Discovered patterns via /keeper-plant.
Review and refine as needed."
git push
```

If the commit or push fails, warn the user:
```
⚠️  WARNING: Seeds were written but NOT pushed.
Run: git add keeper/seeds/*.yaml && git commit -m "plant seeds" && git push
Unpushed seeds don't propagate to new clones or crew members.
```

## Important Notes

- **Parallel execution is required** - Do NOT run discovery sequentially
- **Agents write directly** - They write to files, return only summaries
- **Seeds must be committed** - Uncommitted seeds are lost when worktrees change
- This is a **best-effort discovery** - manual review is required
- Some patterns may be missed or misidentified
- Add `when_to_use` descriptions manually for clarity
- Set `forbidden_extensions` based on team conventions
- Discovery doesn't replace understanding your own codebase
