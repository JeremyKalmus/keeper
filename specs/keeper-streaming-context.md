# Keeper Streaming Context

**Status**: Final
**Author**: keeper/crew/max
**Date**: 2026-01-13
**Revised**: 2026-01-13 (added tiered context for token efficiency)

## Problem Statement

The current keeper implementation blocks the gastown automation flow. When `/keeper-review` is invoked, it produces a decision file and outputs to the console, causing the Mayor to ask the user "what next?" This breaks the autonomous pipeline:

```
Current (broken):
User describes feature
  → /keeper-review (manual)
  → Decision output → BLOCKS waiting for human input
  → Human responds
  → Convoy created
```

The gastown propulsion principle (GUPP) requires: work arrives → process → hand off → next agent runs. No human confirmation loops.

Additionally, the current `post-bead-create` hook does naive keyword matching that doesn't leverage the rich `keeper_decision` structure (reuse, extend, forbidden patterns).

**Secondary problem**: Embedding full work orders in every bead description wastes tokens through redundancy. A 5-bead convoy with 600-token work orders burns 3000 tokens on duplicate context.

## Goal

Transform keeper from a **blocking gate** to **streaming context enrichment** that:

1. Integrates automatically when keeper plugin is installed
2. Does not modify gastown core code
3. Provides rich architectural guidance to polecats via tiered context
4. Maintains forward compatibility as gastown evolves
5. **Minimizes token overhead through shared context and minimal bead references**

## Design Principles

### Plugin Isolation

Keeper operates entirely through:
- Hooks (which gastown already supports)
- Bead descriptions (polecats already read these)
- Files in the keeper plugin directory
- Claude Code settings/commands

No changes to `gt`, `bd`, or gastown internal code.

### Token Efficiency Through Tiered Context

Context is expensive. Polecats have limited context windows. Every token spent on redundant guidance is a token not available for actual work.

**Principle: Load context once, reference many times.**

Three tiers of context, loaded on-demand:

| Tier | What | When Loaded | Token Cost |
|------|------|-------------|------------|
| 1 | Bead reference | Per-bead assignment | ~30 tokens |
| 2 | ADR decision | Once per convoy start | ~500 tokens |
| 3 | Seed vault | On-demand per domain | ~200-400 tokens |

**Anti-pattern**: Embedding full work orders in every bead description.
**Pattern**: Minimal bead reference → shared ADR → on-demand seeds.

### Negative Space is Cheaper

Specify what's forbidden, not everything that's allowed:

```yaml
# Expensive (~200 tokens) - listing everything allowed
reuse: [Button.primary, Button.secondary, Modal, Input, Card, ...]

# Cheap (~40 tokens) - just the exceptions
forbidden: [new-auth-services, custom-buttons, new-modals]
```

Polecats default to reusing existing patterns. Only specify what's off-limits.

### Context Flows Through References

Polecats receive work via bead assignments. The bead description contains a **reference** to keeper context, not the context itself:

```yaml
---
keeper: ADR-017
---
Add user profile modal with logout button.
```

When a polecat starts work on a convoy, it reads the referenced ADR once. All beads in that convoy share the same architectural constraints.

### Inline Review (Not Separate Command)

Instead of `/keeper-review` as a separate step that blocks flow, keeper review happens inline during convoy creation:

```
User: "Add user profile modal with logout button"
Mayor: Creates spec, triggers keeper review automatically
Keeper: Returns decision (approve + context)
Mayor: Creates convoy, beads reference ADR
Polecats: Read ADR once at convoy start → Execute all beads with shared guidance
```

Human only intervenes on rejection.

## Architecture

### Hook Integration Points

| Hook | Trigger | Keeper Action |
|------|---------|---------------|
| `pre-convoy` | Before convoy creation | Review spec, produce ADR, output bead reference format |
| `convoy-briefing` | Polecat starts convoy work | Output ADR content for one-time context load |
| `post-bead-create` | After bead created | (Remove - legacy keyword matching) |
| `keeper-gate.sh` | PreToolUse | (Remove - legacy) |

### New Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. Spec arrives (feature description)                                   │
│                                                                         │
│ 2. gt convoy create triggered                                           │
│    └─→ pre-convoy hook fires                                            │
│        └─→ Keeper reviews spec against seed vault                       │
│            - Analyze proposed components/routes/data                    │
│            - Check against seeds/*.yaml                                 │
│            - Produce keeper/decisions/ADR-NNN.yaml                      │
│                                                                         │
│ 3. Decision status determines flow:                                     │
│    ├─→ APPROVED: Continue, return bead reference format                 │
│    ├─→ REJECTED: Block convoy, return reason to user                    │
│    └─→ DEFERRED: Queue for human review                                 │
│                                                                         │
│ 4. Beads created with MINIMAL frontmatter                               │
│    └─→ Each bead description includes ONLY:                             │
│        ---                                                              │
│        keeper: ADR-NNN                                                  │
│        [optional per-bead overrides]                                    │
│        ---                                                              │
│        Original task description...                                     │
│                                                                         │
│ 5. Polecat assigned to convoy                                           │
│    └─→ convoy-briefing hook fires (or polecat reads ADR directly)       │
│    └─→ ADR content loaded ONCE (~500 tokens)                            │
│    └─→ Polecat has full context for ALL beads in convoy                 │
│                                                                         │
│ 6. Polecat executes beads                                               │
│    └─→ Per-bead overhead: ~30 tokens (just the reference)               │
│    └─→ Reads seeds/*.yaml ON-DEMAND when implementing that domain       │
│                                                                         │
│ 7. Validation (keeper-validate hook on PR/commit)                       │
│    └─→ Check that output matches keeper constraints from ADR            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Token Budget Comparison

| Approach | 5-Bead Convoy | 10-Bead Convoy |
|----------|---------------|----------------|
| Per-bead embedding (old) | ~3000 tokens | ~6000 tokens |
| Tiered context (new) | ~650 tokens | ~800 tokens |

Savings scale with convoy size.

## Context Formats

### Tier 1: Bead Reference (Minimal)

Every bead gets this frontmatter:

```yaml
---
keeper: ADR-017
---
Add user profile modal that displays user info and includes a logout button.
```

That's it. ~30 tokens.

**Per-bead overrides** (rare, only when a specific bead has exceptions):

```yaml
---
keeper: ADR-017
override:
  allow: [new-enum]  # This bead specifically allowed to create an enum
---
Add subscription tier enum and billing model.
```

### Tier 2: ADR Decision File (Shared)

Stored at `keeper/decisions/017-user-profile.yaml`:

```yaml
keeper_decision:
  id: ADR-017
  date: 2026-01-13
  spec: "User profile modal with logout"
  mode: growth
  status: approved

  # What polecats MUST use (brief, with locations)
  reuse:
    frontend: [Modal, Button.primary]
    backend: [AuthService.logout, UserService.getProfile]
    data: [user_status enum]

  # Approved modifications to existing patterns
  extend:
    - target: Modal
      change: "Add 'profile' variant with avatar header slot"

  # What polecats MUST NOT do
  forbidden:
    - new authentication services
    - custom button implementations
    - new modal components

  # Implementation constraints
  constraints:
    - "Profile data via existing UserService"
    - "Logout redirects to /login"
    - "Use existing user_status enum values"

  # Seed file locations (for on-demand lookup)
  seed_refs:
    frontend: keeper/seeds/frontend.yaml
    backend: keeper/seeds/backend.yaml
    data: keeper/seeds/data.yaml
    auth: keeper/seeds/auth.yaml
```

Polecat reads this once at convoy start. ~500 tokens.

### Tier 3: Seed Vault (On-Demand)

Polecats read `seeds/frontend.yaml` only when implementing frontend code. Not pre-loaded.

Example: Polecat working on "Add logout button" reads:
1. ADR-017 (already loaded) → sees `reuse.frontend: [Button.primary]`
2. `seeds/frontend.yaml` → finds `Button.primary` location and usage notes
3. Actual source file → implements

## Constraint Shorthand

Standard constraint codes polecats understand:

| Code | Meaning |
|------|---------|
| `auth-reuse` | Use existing auth services only |
| `ui-extend` | Extend existing UI components, no new ones |
| `data-append` | Enum changes must be append-only |
| `rest-shape` | New routes must follow REST conventions |
| `no-new-seeds` | No new patterns allowed, reuse only |

ADR can use these instead of prose:

```yaml
constraints: [auth-reuse, ui-extend, data-append]
```

## Keeper Review Logic (Inline)

The `pre-convoy` hook will:

1. **Detect spec** - Check if convoy creation includes a spec/description
2. **Load seed vault** - Read `seeds/*.yaml` files
3. **Analyze spec** - Identify proposed:
   - UI components
   - API routes
   - Database changes
   - Auth patterns
4. **Apply decision matrix** - For each element:
   - Does it exist in seeds? → Reuse
   - Can existing be extended? → Extend
   - Is new pattern justified? → Allow (in seeding mode) or gate
5. **Generate ADR** - Write to `keeper/decisions/ADR-NNN.yaml`
6. **Return result**:
   - Approved: Output bead reference format for convoy creation
   - Rejected: Exit non-zero with reason
   - Deferred: Exit with special code for human review queue

### Environment Variables

The hook receives context via environment:

| Variable | Purpose |
|----------|---------|
| `GT_CONVOY_NAME` | Name of convoy being created |
| `GT_CONVOY_SPEC` | Spec/description text |
| `GT_CONVOY_ISSUES` | Issues being tracked |
| `GT_RIG_ROOT` | Rig root (for finding seeds/) |
| `KEEPER_MODE` | Override keeper mode (seeding/growth/conservation) |

### Output Contract

The `pre-convoy` hook outputs to stdout:

```yaml
keeper_result:
  status: approved
  adr: "ADR-017"
  adr_path: "keeper/decisions/017-user-profile.yaml"

  # Frontmatter for beads (minimal reference)
  bead_frontmatter: |
    ---
    keeper: ADR-017
    ---
```

Gastown's convoy creation reads this and prepends frontmatter to bead descriptions.

**File-based fallback** (if stdout parsing not supported):
1. Hook writes ADR to `keeper/decisions/NNN-name.yaml`
2. Hook writes `.keeper-result.yaml` with bead_frontmatter
3. Convoy creation reads `.keeper-result.yaml`

## Convoy Briefing Mechanism

When a polecat starts work on a convoy with keeper context:

**Option A: Hook-based briefing**
```
Polecat assigned to convoy
  → convoy-briefing hook fires
  → Hook reads ADR referenced in first bead
  → Outputs ADR content to polecat's context
  → Polecat proceeds with full context
```

**Option B: Polecat-initiated (simpler)**
```
Polecat reads bead, sees `keeper: ADR-017`
  → Polecat reads keeper/decisions/017-*.yaml
  → Continues with context
```

Option B is simpler and doesn't require new gastown hooks. Polecats already know to read referenced files.

**Polecat instruction** (add to polecat briefing):
```
When your bead has `keeper: ADR-NNN`, read the corresponding file at
keeper/decisions/NNN-*.yaml ONCE at the start of your work. This contains
architectural constraints for your entire convoy. Do not re-read per bead.
```

## Files to Change

### Remove (Legacy)

- `hooks/post-bead-create` - Legacy keyword matching, replaced by tiered context
- `hooks/keeper-gate.sh` - PreToolUse hook, no longer needed

### Modify

- `hooks/pre-convoy` - Full keeper review, output minimal bead frontmatter
- `commands/keeper-review.md` - Keep for manual review, but make optional

### Add

- `lib/keeper-review.sh` - Shared review logic (used by pre-convoy and keeper-review)
- `templates/adr.yaml` - Template for ADR decision files
- `POLECAT-BRIEFING.md` - Instructions for polecats on reading keeper context

## Compatibility

### Gastown Version Requirements

This design assumes gastown supports:
- `pre-convoy` hooks with environment variables
- Reading hook output or sidecar files for bead frontmatter

If bead frontmatter injection isn't supported, the fallback is:
- Keeper writes ADR file
- Mayor manually adds `keeper: ADR-NNN` to bead descriptions
- Still works, slightly more manual

### Forward Compatibility

The design is resilient to gastown changes because:
- Hooks are a stable interface
- Bead descriptions are free-form text (YAML frontmatter is convention)
- ADR files are plain YAML in keeper directory
- No internal gastown code is modified
- Plugin can be removed cleanly

## Migration

1. Deploy new `pre-convoy` hook with ADR generation
2. Remove `post-bead-create` hook
3. Remove `keeper-gate.sh` hook
4. Add polecat briefing instructions
5. Update documentation
6. Run `/keeper-plant` to ensure seed vault is populated

## Success Criteria

1. Convoy creation with keeper installed does NOT prompt for human input (unless rejected)
2. Beads contain minimal `keeper: ADR-NNN` reference (~30 tokens each)
3. ADR file contains full context, loaded once per convoy (~500 tokens)
4. Polecats demonstrably use the specified patterns (measurable via code review)
5. **Token overhead for keeper context < 1000 tokens for any convoy size**
6. Removing keeper plugin does not break gastown
7. Gastown core code remains unmodified

## Resolved Questions

### Q1: Bead enrichment mechanism
**Answer**: Minimal frontmatter injection via pre-convoy hook output. Just `keeper: ADR-NNN`. Full context lives in ADR file.

### Q2: Work order granularity
**Answer**: Convoy-level shared context. All beads reference the same ADR. Per-bead overrides only for genuine exceptions (rare).

### Q3: Validation enforcement
**Answer**: `keeper-validate` should be a **blocking hook** that fails PRs on violations. The whole point is preventing drift. Advisory mode defeats the purpose.

## References

- [keeper-spec.md](../keeper-spec.md) - Original Keeper of the Seeds specification
- [gastown reference.md](../../../../docs/reference.md) - Gastown architecture
- [GUPP](../../../mayor/CLAUDE.md) - Gas Town Propulsion Principle
