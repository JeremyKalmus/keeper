# Keeper of the Seeds

Governance plugin for Gas Town that prevents architectural drift by enforcing reuse, consistency, and deliberate evolution across UI, API, data, and auth layers.

---

## Keeper Lite (Standalone for Claude Code)

**Don't use Gas Town?** Keeper Lite is a standalone version for Claude Code with no dependencies.

```bash
# One-line install
curl -fsSL https://raw.githubusercontent.com/jeremykalmus/keeper/main/keeper-lite/install.sh | bash
```

**Features:**
- No gastown/beads dependency
- Git optional (works with OneDrive, Dropbox, etc.)
- Single-agent workflow (no parallel sub-agents)
- Same core functionality: `/keeper-init`, `/keeper-plant`, `/keeper-review`, `/keeper-tend`

See [`keeper-lite/README.md`](keeper-lite/README.md) for full documentation.

---

## What It Does (Gas Town Version)

The Keeper operates as a **dual-gate system**:

1. **Front Gate (Mayor)**: Reviews specs before work is assigned to polecats
2. **Back Gate (Refinery)**: Validates polecat changes before merge

For every feature, the Keeper answers four questions:
1. **What already exists?** - Scans the seed vault for applicable patterns
2. **Is it sufficient?** - Determines if existing seeds meet the need
3. **If not, what is the smallest extension?** - Prefers extension over creation
4. **If a new seed is required, how is it preserved?** - Records new patterns

This transforms architecture from culture into infrastructure.

## Installation

### Quick Install (Recommended)

```bash
# Install on a rig with default settings (growth mode)
./install/install-keeper.sh ~/gt/myproject

# Install on a new project (seeding mode - more permissive)
./install/install-keeper.sh --mode seeding ~/gt/newproject

# Install on a mature project (conservation mode - strict)
./install/install-keeper.sh --mode conservation ~/gt/stable
```

### Installation Notes

**Session Restart Warning**: Installing Keeper from within an active Claude Code
session (Mayor, crew member, etc.) will **restart that session** to load the new
hooks. Your current conversation context will be lost.

**To avoid losing your session:**
- Install from a **separate terminal** (not from within Claude Code)
- Or use a **separate Claude Code session** dedicated to installation

**Installation Scope**: Keeper installs at the **rig level**, not per-session:
- `/keeper-review` and `/keeper-plant` → Mayor + crew
- `/keeper-validate` → Refinery
- All agents in the rig get access after a single install
- No need to install separately for each agent

### What Gets Installed

```
<rig>/
├── keeper/
│   ├── keeper.yaml           # Configuration
│   ├── seeds/
│   │   ├── frontend.yaml     # UI components, hooks, i18n, design tokens
│   │   ├── backend.yaml      # API routes, services, errors, events
│   │   ├── data.yaml         # Tables, enums, validation schemas
│   │   ├── auth.yaml         # Auth patterns, scopes, roles
│   │   ├── config.yaml       # Feature flags, environment config
│   │   └── testing.yaml      # Test fixtures, mocks, utilities
│   ├── decisions/            # ADR storage
│   └── KEEPER-INSTRUCTIONS.md
└── .claude/commands/
    ├── keeper-review.md      # For Mayor
    └── keeper-validate.md    # For Refinery
```

### Uninstall

```bash
./install/uninstall-keeper.sh ~/gt/myproject
./install/uninstall-keeper.sh --keep-decisions ~/gt/myproject  # Preserve ADRs
```

## Planting Seeds (Initial Setup)

After installation, run `/keeper-plant` to discover existing patterns in your codebase:

```
> /keeper-plant

KEEPER PLANT SEEDS: COMPLETE

Discovered Patterns:
  Frontend:
    - Components: 24
    - Hooks: 8
    - Design tokens: found

  Backend:
    - API Routes: 15
    - Services: 6
    - GraphQL: not found

  Data:
    - Tables: 12
    - Enums: 7
    - Validation schemas: 4

  Auth:
    - Auth type: jwt
    - Scopes: 5
    - Roles: 3
```

### What Gets Discovered

| Category | Patterns Found |
|----------|---------------|
| **Frontend** | Components, custom hooks, state stores, i18n keys, design tokens |
| **Backend** | REST routes, services, error types, logging patterns, event schemas |
| **Data** | Database tables, enums, validation schemas (Zod/Yup), type aliases |
| **Auth** | Auth type (JWT/session), scopes, roles, token shapes |
| **Config** | Feature flags, environment variables, config files |
| **Testing** | Test fixtures, mock services, test utilities, coverage config |

Discovery uses **parallel sub-agents** (one per category) to handle large codebases
without context overflow.

### After Discovery

1. **Review** `keeper/seeds/*.yaml` - discovery is best-effort
2. **Add missing patterns** that weren't auto-detected
3. **Set `forbidden_extensions`** for each component
4. **Add `when_to_use`** descriptions for clarity

## Keeper Dashboard

A Storybook-like UI for browsing your seed vaults and decisions.

![Dashboard Preview](dashboard/preview.png)

### Features

- **Browse Seeds**: Navigate all 6 seed vaults with collapsible sections
- **Live Previews**: Interactive component previews for frontend seeds
- **Decision Log**: View all Keeper decisions with expandable details
- **Real-time Updates**: Auto-refreshes when YAML files change (via SSE)
- **Dark Theme**: Clean "Digital Greenhouse" aesthetic

### Install Dashboard

```bash
# For projects that have run /keeper-plant:
curl -fsSL https://raw.githubusercontent.com/JeremyKalmus/keeper/main/dashboard/setup.sh | bash

# Then start it:
cd dashboard
bun install
bun run dev

# Open http://localhost:5173
```

### Update Dashboard

```bash
# Pull latest while preserving your customizations:
cd dashboard
./update.sh
```

### Add Component Previews

Edit `dashboard/src/components/ComponentPreview.tsx` to add live previews of your project's components:

```tsx
// Import your component
import { YourButton } from '../../src/components/YourButton'

// Add a case in the switch statement:
case 'YourButton':
  return (
    <PreviewWrapper>
      <YourButton variant="primary" onClick={() => {}}>
        Click me
      </YourButton>
    </PreviewWrapper>
  )
```

### Dashboard Structure

```
dashboard/
├── server/index.ts       # Bun server (port 3333)
│   ├── GET /api/vaults       # List all seed vaults
│   ├── GET /api/vault/:name  # Get vault contents
│   ├── GET /api/decisions    # List decisions
│   └── SSE /api/events       # Real-time file changes
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx           # Vault navigation
│   │   ├── SeedDetail.tsx        # Seed display
│   │   ├── DecisionLog.tsx       # Decision history
│   │   └── ComponentPreview.tsx  # Live previews (customize this!)
│   └── hooks/
│       └── useRealtimeUpdates.ts # SSE subscription
├── setup.sh              # Install script
└── update.sh             # Update script
```

## Mayor Integration

**IMPORTANT**: The Mayor must run `/keeper-review` before creating beads for any feature work.

### Mayor Workflow

```
1. Receive feature spec/request
2. Run: /keeper-review <spec-file>
3. Wait for APPROVED status
4. Create beads with ADR reference:
   - Include "Keeper ADR: NNN" in description
   - Include constraints from keeper_decision
5. Sling to polecats
```

### Example Mayor Session

```
User: "Add a notification system to alert users when tasks complete"

Mayor: Let me review this against the Keeper first.

> /keeper-review notification-spec.md

KEEPER DECISION: APPROVED WITH CONDITIONS
- Reuse: notifications table (exists), Button component
- Extensions: Button notification variant
- Conditions: NotificationToast needs justification
- Forbidden: New auth services

Mayor: Creating beads with Keeper constraints...

> bd create --title="Add notification status field" \
    --body="Keeper ADR: 001. MUST use existing notifications table."
```

## Refinery Integration

The Refinery must run `/keeper-validate` before merging any polecat PR.

### Refinery Workflow

```
1. Polecat submits PR
2. Run: /keeper-validate <adr-id>
3. If APPROVED → merge
4. If REJECTED → return to polecat with violations
```

### Example Validation

```
> /keeper-validate 001

KEEPER VALIDATION: REJECTED

Violations: 2

1. [FORBIDDEN] NotificationToast.tsx created
   - Was in CONDITIONS, not APPROVED

2. [CONSTRAINT] Enum has unapproved value 'archived'
   - Approved: [unread, read, dismissed]
   - Found: [unread, read, dismissed, archived]

Polecat must revise and resubmit.
```

## Keeper Modes

Set in `keeper/keeper.yaml`:

| Mode | When to Use | Behavior |
|------|-------------|----------|
| `seeding` | New project | Allows new seeds freely, warns instead of blocks |
| `growth` | Default | Reuse-first, extensions preferred, new seeds gated |
| `conservation` | Mature project | New seeds almost always rejected |

## Seed Vault Format

The seed vault is a machine-readable registry in `keeper/seeds/`:

### frontend.yaml
```yaml
components:
  Button:
    variants: [primary, secondary, danger]
    location: src/ui/Button.tsx
    when_to_use: "Any clickable action"
    forbidden_extensions:
      - custom colors outside design system
```

### backend.yaml
```yaml
api_routes:
  GET /users/:id:
    purpose: "User profile retrieval"
    auth_required: true
    scopes: [user:read]

services:
  AuthService:
    responsibilities: [token issuance, token validation]
    forbidden: [user creation]
```

### data.yaml
```yaml
enums:
  user_status:
    values: [active, suspended, deleted]
    extension_policy: append-only
    scope: global
```

### auth.yaml
```yaml
auth_model:
  type: jwt
  forbidden_patterns:
    - localStorage for tokens
    - tokens in URL params

scopes:
  user:read:
    granted_to: [user, admin]
```

### config.yaml
```yaml
feature_flags:
  new_dashboard:
    description: "Enable redesigned dashboard"
    default: false
    rollout: percentage
    owner: "frontend-team"
    lifecycle: experimental

environment_vars:
  DATABASE_URL:
    required: true
    sensitive: true
    used_by: [api, worker]
```

### testing.yaml
```yaml
test_fixtures:
  UserFixture:
    location: tests/fixtures/user.ts
    creates: "User entity with sensible defaults"
    variants: [admin, regular, guest]

mock_services:
  MockAuthService:
    location: tests/mocks/auth.ts
    mocks: AuthService
    default_behavior: "Returns valid user"
```

## Decision Matrix

The Keeper uses deterministic matrices:

### Frontend
| Question | Yes | No |
|----------|-----|-----|
| Component exists? | Use it | Continue |
| Variant fits? | Use variant | Extend |
| Breaks design system? | **REJECT** | Approve |

### Backend
| Question | Yes | No |
|----------|-----|-----|
| Route exists? | Extend | Continue |
| Backward-compatible? | Modify | New route |
| Matches REST? | Approve | **REJECT** |

### Data
| Question | Yes | No |
|----------|-----|-----|
| Enum exists? | Extend | Continue |
| Append-only? | OK | **REJECT** |

### Auth
| Question | Yes | No |
|----------|-----|-----|
| Auth service exists? | Use it | **BLOCK** |

## Commands

| Command | Who | When |
|---------|-----|------|
| `/keeper-plant` | Mayor | Once after install (discovers existing patterns) |
| `/keeper-review <spec>` | Mayor | Before creating beads |
| `/keeper-validate <adr>` | Refinery | Before merging PR |

## Key Principles

- **Prefer reuse over extension**
- **Prefer extension over creation**
- **Reject if uncertain**
- A pattern must appear **twice** as an extension before promotion to seed

The Keeper is not a "helpful" agent. It is a **librarian with veto power**.

## The Rule

> **No Keeper, no convoy. No seeds, no Keeper.**
