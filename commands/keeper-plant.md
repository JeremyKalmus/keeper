---
description: Discover existing patterns and populate the Seed Vault (run once after install)
allowed-tools: Read,Glob,Grep,Bash(find:*),Bash(ls:*),Bash(cat:*),Bash(grep:*)
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
# Look for common source directories
ls -d src/ app/ lib/ packages/ 2>/dev/null | head -1
```

If not found, use current directory.

## Step 2: Set Discovery Mode

If `--mode` specified in arguments, note it. Otherwise default to `seeding` for new discovery.

## Step 3: Discover Frontend Components

### 3A. Find React Components
```bash
find . -type f \( -name "*.tsx" -o -name "*.jsx" \) | grep -iE "(component|ui|shared)" | head -50
```

For each component file found, extract:
- Component name (from filename or export)
- Props/variants (look for type definitions)
- Location (file path)

### 3B. Find Vue Components
```bash
find . -type f -name "*.vue" | head -50
```

### 3C. Find Svelte Components
```bash
find . -type f -name "*.svelte" | head -50
```

### 3D. Identify Component Patterns
Look for:
- Design system directories (`ui/`, `components/shared/`, `design-system/`)
- Component libraries (`Button`, `Input`, `Modal`, `Card`, etc.)
- Variant patterns (primary, secondary, danger, etc.)

**Record in frontend.yaml:**
```yaml
components:
  <ComponentName>:
    variants: [discovered, variants]
    location: path/to/Component.tsx
    props: [key, props, found]
    when_to_use: "<infer from name/context>"
```

## Step 4: Discover Backend API Routes

### 4A. Find Express/Fastify Routes
```bash
grep -r "router\.\(get\|post\|put\|patch\|delete\)" --include="*.ts" --include="*.js" -l
grep -r "app\.\(get\|post\|put\|patch\|delete\)" --include="*.ts" --include="*.js" -l
```

### 4B. Find Next.js/Remix API Routes
```bash
find . -path "*/api/*" -type f \( -name "*.ts" -o -name "*.js" \) | head -30
find . -path "*routes*" -type f \( -name "*.ts" -o -name "*.js" \) | head -30
```

### 4C. Find GraphQL Definitions
```bash
find . -type f \( -name "*.graphql" -o -name "*.gql" \) | head -20
grep -r "type Query" --include="*.ts" --include="*.graphql" -l
```

For each route found, extract:
- HTTP method (GET, POST, etc.)
- Path pattern (/users/:id, etc.)
- Auth requirements (look for middleware)

**Record in backend.yaml:**
```yaml
api_routes:
  <METHOD> <path>:
    purpose: "<inferred from path/handler>"
    auth_required: <true|false>
    scopes: [if found]

services:
  <ServiceName>:
    location: path/to/service.ts
    responsibilities: [inferred]
```

## Step 5: Discover Database Schema

### 5A. Find Prisma Schema
```bash
find . -name "schema.prisma" | head -1
```

### 5B. Find TypeORM Entities
```bash
grep -r "@Entity" --include="*.ts" -l
```

### 5C. Find Drizzle Schema
```bash
find . -type f -name "*.ts" | xargs grep -l "pgTable\|mysqlTable\|sqliteTable" 2>/dev/null | head -10
```

### 5D. Find SQL Migrations
```bash
find . -path "*migration*" -name "*.sql" | head -20
```

### 5E. Find Mongoose Models
```bash
grep -r "mongoose.model\|new Schema" --include="*.ts" --include="*.js" -l
```

For each table/model found, extract:
- Table name
- Key columns/fields
- Relationships (foreign keys)
- Indexes

**Record in data.yaml:**
```yaml
tables:
  <table_name>:
    primary_key: id
    columns: [discovered, columns]
    relationships: [if found]
    indexes: [if found]
```

## Step 6: Discover Enumerations

### 6A. Find TypeScript Enums
```bash
grep -r "^export enum\|^enum " --include="*.ts" | head -30
```

### 6B. Find Type Unions (String Literals)
```bash
grep -r "type.*=.*|" --include="*.ts" | grep -E "'[a-z]+'\s*\|" | head -30
```

### 6C. Find Database Enums
Look in Prisma schema, migrations, or ORM definitions for enum types.

For each enum found, extract:
- Enum name
- Values
- Where it's used (scope)

**Record in data.yaml:**
```yaml
enums:
  <enum_name>:
    values: [discovered, values]
    extension_policy: append-only  # default safe policy
    scope: <global|table:name>
```

## Step 7: Discover Auth Patterns

### 7A. Find Auth Configuration
```bash
find . -type f \( -name "*auth*" -o -name "*jwt*" -o -name "*session*" \) \
  \( -name "*.ts" -o -name "*.js" -o -name "*.json" \) | head -20
```

### 7B. Find Permission/Scope Definitions
```bash
grep -r "scope\|permission\|role" --include="*.ts" | grep -iE "enum|type|const" | head -20
```

### 7C. Find Auth Middleware
```bash
grep -r "authenticate\|authorize\|requireAuth\|isAuthenticated" --include="*.ts" -l
```

For each auth pattern found, extract:
- Auth type (JWT, session, OAuth)
- Token configuration
- Scopes/permissions defined
- Role hierarchy

**Record in auth.yaml:**
```yaml
auth_model:
  type: <jwt|session|oauth>
  token_types: [discovered]

scopes:
  <scope_name>:
    description: "<inferred>"
    granted_to: [roles]

roles:
  <role_name>:
    inherits: [other_roles]
```

## Step 8: Discover Additional Patterns

### 8A. Custom Hooks
```bash
find . -type f -name "use*.ts" -o -name "use*.tsx" | head -20
grep -r "^export function use[A-Z]" --include="*.ts" --include="*.tsx" | head -20
```

### 8B. Services/Utilities
```bash
find . -path "*service*" -type f -name "*.ts" | head -20
find . -path "*util*" -type f -name "*.ts" | head -20
```

### 8C. State Management
```bash
# Redux
find . -type f -name "*slice*.ts" -o -name "*reducer*.ts" | head -10
# Zustand
grep -r "create(" --include="*.ts" | grep -i "zustand\|store" | head -10
# Context
grep -r "createContext\|useContext" --include="*.tsx" -l | head -10
```

### 8D. Validation Schemas
```bash
grep -r "z\.object\|z\.string\|yup\.\|Joi\." --include="*.ts" -l | head -10
```

### 8E. Design Tokens
```bash
find . -type f \( -name "*tokens*" -o -name "*theme*" -o -name "*variables*" \) \
  \( -name "*.ts" -o -name "*.css" -o -name "*.scss" -o -name "*.json" \) | head -10
```

## Step 9: Generate Seed Vault Files

Write all discoveries to the seed files:

1. **keeper/seeds/frontend.yaml** - Components, hooks, design tokens
2. **keeper/seeds/backend.yaml** - Routes, services, utilities
3. **keeper/seeds/data.yaml** - Tables, enums, validation schemas
4. **keeper/seeds/auth.yaml** - Auth config, scopes, roles

Use the existing template format, filling in discovered patterns.

## Step 10: Generate Discovery Report

Output a summary:

```
KEEPER PLANT SEEDS: COMPLETE

Discovered Patterns:
  Frontend:
    - Components: <count>
    - Hooks: <count>
    - Design tokens: <found|not found>

  Backend:
    - API Routes: <count>
    - Services: <count>
    - GraphQL: <found|not found>

  Data:
    - Tables: <count>
    - Enums: <count>
    - Validation schemas: <count>

  Auth:
    - Auth type: <jwt|session|none>
    - Scopes: <count>
    - Roles: <count>

Seed Vault populated at: keeper/seeds/

Mode set to: <seeding|growth>

Next steps:
1. Review keeper/seeds/*.yaml for accuracy
2. Add any patterns that weren't auto-discovered
3. Set forbidden_extensions for each component
4. Run /keeper-review on your first spec
```

## Important Notes

- This is a **best-effort discovery** - manual review is required
- Some patterns may be missed or misidentified
- Add `when_to_use` descriptions manually for clarity
- Set `forbidden_extensions` based on team conventions
- Discovery doesn't replace understanding your own codebase
