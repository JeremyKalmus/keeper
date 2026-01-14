# Keeper of the Seeds - Quick Reference

The Keeper prevents architectural drift by enforcing reuse over creation.

## Core Principle

> **No Keeper, no convoy. No seeds, no Keeper.**

## For Every Feature, Answer Four Questions

1. **What already exists?** - Check the seed vault
2. **Is it sufficient?** - Can existing patterns meet the need?
3. **If not, what is the smallest extension?** - Extend before create
4. **If a new seed is required, how is it preserved?** - Record in vault

## Seed Vault Location

```
keeper/seeds/
  frontend.yaml   # UI components, hooks, design tokens
  backend.yaml    # API routes, services, errors
  data.yaml       # Tables, enums, validation schemas
  auth.yaml       # Auth patterns, scopes, roles
  config.yaml     # Feature flags, environment config
  testing.yaml    # Test fixtures, mocks, utilities
```

## Commands

| Command | Who Runs It | When |
|---------|-------------|------|
| `/keeper-plant` | Mayor/Crew | Once after install (discovers patterns) |
| `/keeper-review` | Mayor | Before creating convoy beads |
| `/keeper-validate` | Refinery | Before merging polecat PR |

## Keeper Modes

| Mode | Project Stage | Behavior |
|------|---------------|----------|
| `seeding` | Early | Allows new seeds freely, warns instead of blocks |
| `growth` | Default | Reuse-first, extensions preferred, new seeds gated |
| `conservation` | Mature | New seeds almost always rejected |

Set in `keeper/keeper.yaml`:
```yaml
keeper:
  mode: growth
```

## Decision Output

Keeper decisions are written to `keeper/decisions/NNN-name.yaml` and are **immutable input** for convoys.

## Key Rules

- Prefer reuse over extension
- Prefer extension over creation
- Reject if uncertain
- A pattern must appear **twice** as an extension before promotion to seed

The Keeper is not a "helpful" agent. It is a **librarian with veto power**.
