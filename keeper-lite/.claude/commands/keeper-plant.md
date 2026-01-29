---
description: Discover existing patterns and populate the Seed Vault using sub-agents
allowed-tools: Read,Write,Glob,Grep,Bash(ls:*),Bash(find:*),Task
argument-hint: [--category frontend|backend|data|auth] [--mode seeding|growth]
---

# Keeper Plant Seeds

You are the **Keeper of the Seeds** performing initial discovery of existing patterns.

This command uses **sub-agents** to scan the codebase and populate the Seed Vault.
Each sub-agent handles one category and writes directly to files, keeping your context clean.

**Arguments**: $ARGUMENTS

## Step 1: Verify Initialization

Check that Keeper is initialized:

```bash
ls .keeper/config.json 2>/dev/null
```

If not found, abort with:
```
ERROR: Keeper not initialized. Run /keeper-init first.
```

## Step 2: Load Configuration

Read `.keeper/config.json` to get current mode.
If `--mode` argument provided, use that instead.

## Step 3: Locate Source Code

Search for common source directories:

```bash
ls -d src/ app/ lib/ packages/ 2>/dev/null | head -1
```

Note the source directory for the sub-agents.

## Step 4: Launch Parallel Discovery Sub-Agents

**CRITICAL**: Use the Task tool to spawn sub-agents. Each agent:
1. Discovers patterns for ONE seed category
2. **Writes directly to the seed file** (do NOT return full YAML)
3. Returns only a **brief summary** (counts)

This keeps discovery data in sub-agent context, not yours.

**Launch ALL 4 agents in a SINGLE message with multiple Task tool calls:**

### Agent 1: Frontend Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:

"You are a Keeper seed discovery agent for FRONTEND patterns.

TASK:
1. First, read the existing seed file: .keeper/seeds/frontend.yaml
2. Scan the codebase for frontend patterns:
   - Components: React/Vue/Svelte in **/*.tsx, **/*.jsx, ui/, components/
   - Hooks: Custom hooks (use*.ts files)
   - State Stores: Redux, Zustand, Context providers
   - Design Tokens: Theme files, CSS variables, Tailwind config
3. For each discovered pattern, note: name, location, variants if any
4. WRITE your discoveries directly to .keeper/seeds/frontend.yaml
   - Preserve any existing entries
   - Add discovered items with '# discovered' comment
   - Use format: ComponentName: { location: path, variants: [default], when_to_use: 'TODO' }
5. Return ONLY a brief summary like:
   'Frontend: 12 components, 5 hooks, 2 stores discovered'

Do NOT return the full YAML content - write it to the file directly.
Only report patterns you actually find - do not invent patterns."
```

### Agent 2: Backend Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:

"You are a Keeper seed discovery agent for BACKEND patterns.

TASK:
1. First, read the existing seed file: .keeper/seeds/backend.yaml
2. Scan the codebase for backend patterns:
   - API Routes: REST endpoints, Next.js API routes, Express routes
   - Services: Service classes/modules (*Service.ts, services/*.ts)
   - Error Types: Custom error classes, error codes
   - Events: Domain events, message queue patterns
3. For routes, note: path, methods, auth requirements
4. WRITE your discoveries directly to .keeper/seeds/backend.yaml
   - Preserve any existing entries
   - Add discovered items with '# discovered' comment
5. Return ONLY a brief summary like:
   'Backend: 8 routes, 4 services, 2 error types discovered'

Do NOT return the full YAML content - write it to the file directly.
Only report patterns you actually find - do not invent patterns."
```

### Agent 3: Data Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:

"You are a Keeper seed discovery agent for DATA patterns.

TASK:
1. First, read the existing seed file: .keeper/seeds/data.yaml
2. Scan the codebase for data patterns:
   - Enums: TypeScript enums, string union types
   - Types: Interfaces, type aliases in types/*.ts
   - Schemas: Zod, Yup, Joi validation schemas
   - Tables: Prisma models, Drizzle tables, database schemas
3. For enums, note: name, values, location
4. WRITE your discoveries directly to .keeper/seeds/data.yaml
   - Preserve any existing entries
   - Add discovered items with '# discovered' comment
   - Mark enums as append_only: true
5. Return ONLY a brief summary like:
   'Data: 7 enums, 10 types, 3 schemas discovered'

Do NOT return the full YAML content - write it to the file directly.
Only report patterns you actually find - do not invent patterns."
```

### Agent 4: Auth Discovery
```
Use Task tool with subagent_type="general-purpose" and prompt:

"You are a Keeper seed discovery agent for AUTH patterns.

TASK:
1. First, read the existing seed file: .keeper/seeds/auth.yaml
2. Scan the codebase for auth patterns:
   - Auth Model: JWT, session, OAuth configuration
   - Scopes: Permission scopes defined
   - Roles: Role definitions
   - Middleware: Auth middleware patterns
3. Identify the primary auth approach (JWT, session, etc.)
4. WRITE your discoveries directly to .keeper/seeds/auth.yaml
   - Preserve any existing entries
   - Add discovered items with '# discovered' comment
5. Return ONLY a brief summary like:
   'Auth: jwt model, 5 scopes, 3 roles discovered'

Do NOT return the full YAML content - write it to the file directly.
Only report patterns you actually find - do not invent patterns."
```

## Step 5: Collect Results

After all 4 agents complete, compile their **summaries only** into a report:

```
KEEPER PLANT: COMPLETE

Mode: <mode from config>
Source: <source directory>

Discovered Patterns:
  Frontend: <agent 1 summary>
  Backend: <agent 2 summary>
  Data: <agent 3 summary>
  Auth: <agent 4 summary>

Seed files updated:
  .keeper/seeds/frontend.yaml
  .keeper/seeds/backend.yaml
  .keeper/seeds/data.yaml
  .keeper/seeds/auth.yaml

Next steps:
1. Review .keeper/seeds/*.yaml for accuracy
2. Fill in "TODO" descriptions for when_to_use
3. Add forbidden_patterns where appropriate
4. Run /keeper-review before implementing new features
```

## Important Notes

- **Parallel execution required** - Launch all 4 agents in ONE message
- **Agents write directly** - They write to files, return only summaries
- This keeps YOUR context clean for the final report
- Discovery is best-effort - manual review required
- Safe to re-run - adds new patterns, preserves existing
