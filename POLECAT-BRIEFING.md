# Polecat Briefing: Keeper Context

When working on a convoy with Keeper governance, follow this tiered context system for token efficiency.

## Reading Keeper Context

### Step 1: Check Your Bead

Your bead description will have YAML frontmatter with a keeper reference:

```yaml
---
keeper: ADR-017
---
Add user profile modal with logout button.
```

The `keeper: ADR-NNN` line tells you which Architectural Decision Record governs your work.

### Step 2: Read the ADR (Once Per Convoy)

At the **start of your convoy work**, read the referenced ADR file:

```
keeper/decisions/NNN-*.yaml
```

Example: For `keeper: ADR-017`, read `keeper/decisions/017-*.yaml`

**Read this ONCE.** All beads in your convoy share the same architectural constraints. Do not re-read per bead.

### Step 3: Understand ADR Structure

The ADR contains:

| Section | What It Means |
|---------|---------------|
| `reuse` | Patterns you MUST use (they exist, don't recreate) |
| `extend` | Approved modifications to existing patterns |
| `forbidden` | What you MUST NOT do |
| `constraints` | Implementation rules to follow |
| `seed_refs` | Locations of seed files for detailed lookup |

### Step 4: On-Demand Seed Lookup

Only read seed files when implementing that domain:

- Working on UI? → Read `keeper/seeds/frontend.yaml`
- Working on API? → Read `keeper/seeds/backend.yaml`
- Working on DB? → Read `keeper/seeds/data.yaml`
- Working on auth? → Read `keeper/seeds/auth.yaml`

Don't pre-load all seeds. Load on-demand as you work.

## Constraint Shorthand Codes

ADRs may use these standard codes:

| Code | Meaning |
|------|---------|
| `auth-reuse` | Use existing auth services only |
| `ui-extend` | Extend existing UI components, no new ones |
| `data-append` | Enum changes must be append-only |
| `rest-shape` | New routes must follow REST conventions |
| `no-new-seeds` | No new patterns allowed, reuse only |

## Per-Bead Overrides (Rare)

Occasionally a specific bead has exceptions:

```yaml
---
keeper: ADR-017
override:
  allow: [new-enum]
---
Add subscription tier enum.
```

Only follow overrides explicitly stated in your bead.

## Token Budget

This tiered system keeps context costs low:

| What | Tokens | When |
|------|--------|------|
| Bead reference | ~30 | Per bead |
| ADR content | ~500 | Once per convoy |
| Seed file | ~200-400 | On-demand per domain |

## Summary

1. See `keeper: ADR-NNN` in bead → read that ADR file once
2. Follow reuse/extend/forbidden rules from ADR
3. Read seed files on-demand when implementing that domain
4. Respect any per-bead overrides

The Keeper is not negotiable. Violations will be caught at validation.
