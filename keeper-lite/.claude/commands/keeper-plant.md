---
description: Discover existing patterns and populate the Seed Vault
allowed-tools: Read,Write,Glob,Grep,Bash(ls:*),Bash(find:*)
argument-hint: [--category frontend|backend|data|auth] [--mode seeding|growth]
---

# Keeper Plant Seeds

You are the **Keeper of the Seeds** performing initial discovery of existing patterns.

This command scans the codebase and populates the Seed Vault with what already exists.

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

## Step 3: Determine Scope

If `--category` specified, only scan that category.
Otherwise, scan all categories: frontend, backend, data, auth.

## Step 4: Locate Source Code

Search for common source directories:

```bash
ls -d src/ app/ lib/ packages/ 2>/dev/null | head -1
```

Use the first found, or current directory if none.

## Step 5: Discover Patterns

Scan each category using Glob and Grep. For each discovered pattern, add to the appropriate seed file.

### Frontend Discovery

Search for:
- **Components**: `*.tsx`, `*.jsx` in `ui/`, `components/`, `shared/`
- **Hooks**: Files matching `use*.ts` or `use*.tsx`
- **Stores**: Files with `store`, `context`, or state management imports

Use Glob to find files:
- `**/*.tsx`
- `**/*.jsx`
- `**/use*.ts`

Use Grep to identify:
- `export (default )?function \w+` - component definitions
- `export function use\w+` - hooks
- `createContext|createStore|create\(` - state stores

Update `.keeper/seeds/frontend.yaml` with discovered patterns.
Mark each with `# discovered by keeper-plant`.

### Backend Discovery

Search for:
- **Routes**: Files in `api/`, `routes/`, or containing route handlers
- **Services**: Files matching `*Service.ts`, `*service.ts`
- **Events**: Event definitions, message queue patterns

Use Grep to identify:
- `GET|POST|PUT|DELETE|PATCH` - HTTP methods
- `router\.|app\.` - route definitions
- `class \w+Service|Service =` - service classes

Update `.keeper/seeds/backend.yaml` with discovered patterns.

### Data Discovery

Search for:
- **Enums**: TypeScript enums, string union types
- **Types**: Interface and type definitions
- **Schemas**: Zod, Yup, Joi schemas
- **Tables**: Prisma models, Drizzle tables, SQL migrations

Use Grep to identify:
- `enum \w+` - enums
- `(type|interface) \w+` - types
- `z\.object|yup\.object|Joi\.object` - schemas
- `model \w+ \{|createTable` - database tables

Update `.keeper/seeds/data.yaml` with discovered patterns.

### Auth Discovery

Search for:
- **Auth patterns**: JWT, session, OAuth configuration
- **Middleware**: Auth middleware
- **Scopes/Roles**: Permission definitions

Use Grep to identify:
- `jwt|JWT|jsonwebtoken` - JWT usage
- `session|Session` - session auth
- `scope|permission|role` - authorization

Update `.keeper/seeds/auth.yaml` with discovered patterns.

## Step 6: Write Seeds

For each category, update the seed file using this format:

```yaml
components:
  DiscoveredComponent:  # discovered by keeper-plant
    location: path/to/file.tsx
    variants: [default]
    when_to_use: "TODO: describe usage"
```

**Important**:
- Preserve any existing manually-added entries
- Add `# discovered by keeper-plant` comment to auto-discovered entries
- Set `when_to_use: "TODO: describe usage"` for manual review

## Step 7: Generate Report

Output a summary:

```
KEEPER PLANT: COMPLETE

Mode: <seeding|growth|conservation>
Scanned: <source directory>

Discovered Patterns:
  Frontend:
    - Components: N found
    - Hooks: N found
    - Stores: N found
  Backend:
    - Routes: N found
    - Services: N found
  Data:
    - Enums: N found
    - Types: N found
    - Schemas: N found
  Auth:
    - Patterns: N found

Seed files updated:
  .keeper/seeds/frontend.yaml
  .keeper/seeds/backend.yaml
  .keeper/seeds/data.yaml
  .keeper/seeds/auth.yaml

Next steps:
1. Review discovered patterns in .keeper/seeds/
2. Fill in "TODO" descriptions for when_to_use
3. Add forbidden_patterns where appropriate
4. Run /keeper-review before implementing new features
```

## Important Notes

- Discovery is **best-effort** - some patterns may be missed
- Always review and refine auto-discovered seeds
- Add `forbidden_patterns` based on your project conventions
- This command is safe to re-run - it adds new patterns but preserves existing
- Large codebases may take a moment to scan
