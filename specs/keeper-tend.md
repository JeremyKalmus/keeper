# Keeper Tend - Incremental Seed Maintenance

**Status**: Proposed (Future Enhancement)
**Author**: keeper/crew/max
**Date**: 2026-01-13

## Problem Statement

Currently, `/keeper-plant` is the only way to update the seed vault. It performs full codebase discovery, which is:
- Heavy for routine use
- Designed for initial setup, not ongoing maintenance
- Overkill when you just finished a work session and want to check "did I miss anything?"

After a coding session, developers often create new patterns (components, services, routes) without realizing they should be documented as seeds. There's no lightweight way to catch this.

## Goal

Add `/keeper-tend` - a lightweight command for incremental seed maintenance that:

1. Checks recent changes against the seed vault
2. Identifies new patterns that should be documented
3. Suggests additions (or auto-adds in seeding mode)
4. Runs quickly (<10 seconds vs minutes for full plant)

## The Gardening Model

| Command | Frequency | Scope | Purpose |
|---------|-----------|-------|---------|
| `/keeper-plant` | Once (install) | Full codebase | Initial seed vault population |
| `/keeper-tend` | After work sessions | Recent changes | Incremental maintenance |
| `/keeper-review` | Per feature | Spec analysis | Pre-convoy governance |
| `/keeper-validate` | Per PR | Code diff | Post-implementation check |

`keeper-tend` fills the gap between initial setup and feature-specific review.

## Design

### Input Sources

`keeper-tend` can check multiple sources for recent changes:

1. **Git-based** (default)
   - `git diff HEAD~N` - Last N commits
   - `git diff main` - Changes on current branch
   - `git diff --staged` - Staged changes

2. **Time-based**
   - Changes in last N hours/days
   - Since last `keeper-tend` run (tracked in `.keeper-state`)

3. **Explicit**
   - Specific files passed as arguments

### Detection Logic

Reuse pattern detection from `/keeper-plant`, but scoped to changed files only:

```
For each changed file:
  1. Detect domain (frontend/backend/data/auth)
  2. Extract patterns (components, services, routes, enums)
  3. Compare against seed vault
  4. Flag patterns not in vault
```

### Output Modes

**Interactive (default)**
```
$ /keeper-tend

Checking changes since last tend (3 hours ago)...

Found 2 new patterns not in seed vault:

  Frontend:
    + ProfileCard component (src/ui/ProfileCard.tsx)
      Variants: default
      Suggestion: Add to seeds/frontend.yaml

  Backend:
    + GET /api/users/:id/preferences (src/routes/users.ts)
      Auth: required
      Suggestion: Add to seeds/backend.yaml

Actions:
  [A] Add all to seed vault
  [S] Select which to add
  [I] Ignore (mark as reviewed)
  [Q] Quit
```

**Auto mode** (for seeding mode or CI)
```
$ /keeper-tend --auto

Added 2 patterns to seed vault:
  - ProfileCard → seeds/frontend.yaml
  - GET /api/users/:id/preferences → seeds/backend.yaml
```

**Dry-run mode**
```
$ /keeper-tend --dry-run

Would add 2 patterns:
  - ProfileCard (frontend)
  - GET /api/users/:id/preferences (backend)
```

### Ignore Patterns

Not everything new should be a seed. Support ignore patterns:

```yaml
# keeper/keeper.yaml
tend:
  ignore:
    - "**/test/**"           # Test files
    - "**/stories/**"        # Storybook
    - "**/*.mock.ts"         # Mocks
    - "src/internal/**"      # Internal utilities
```

### State Tracking

Track when `keeper-tend` was last run:

```yaml
# keeper/.keeper-state
last_tend:
  timestamp: 2026-01-13T22:30:00Z
  commit: abc123
  patterns_found: 2
  patterns_added: 2
```

This allows default behavior to be "since last tend" without arguments.

## Command Specification

```
/keeper-tend [options] [files...]

Options:
  --since <ref>      Git ref to diff against (default: last tend or HEAD~5)
  --auto             Auto-add without prompting (respects keeper mode)
  --dry-run          Show what would be added without changing anything
  --all              Check entire codebase (equivalent to keeper-plant)
  --json             Output as JSON for tooling

Examples:
  /keeper-tend                    # Changes since last tend
  /keeper-tend --since HEAD~3     # Last 3 commits
  /keeper-tend --since main       # Changes on branch
  /keeper-tend src/ui/            # Specific directory
  /keeper-tend --auto             # Auto-add in seeding mode
```

## Integration with Keeper Modes

| Mode | Behavior |
|------|----------|
| seeding | Auto-add new patterns, minimal friction |
| growth | Prompt for each pattern, require justification for complex ones |
| conservation | Flag only, require explicit approval to add |

## Implementation

### Files to Add

- `commands/keeper-tend.md` - Slash command definition
- `lib/tend.sh` - Core logic (or extend existing plant logic)

### Files to Modify

- `keeper/keeper.yaml` - Add `tend` config section
- `plugin.yaml` - Register new command

### Reuse from keeper-plant

The pattern detection logic in `/keeper-plant` should be extracted to shared library:

```
lib/
  detect-patterns.sh    # Pattern detection (used by plant + tend)
  update-seeds.sh       # Seed vault updates (used by plant + tend)
```

`keeper-plant` = full scan + `update-seeds`
`keeper-tend` = incremental scan + `update-seeds`

## Success Criteria

1. `keeper-tend` completes in <10 seconds for typical work sessions
2. Detects patterns that `keeper-plant` would detect (same accuracy)
3. State tracking allows "since last tend" default behavior
4. Integrates with keeper modes (auto in seeding, gated in conservation)
5. Ignore patterns prevent noise from tests/mocks

## Future Enhancements

- **Git hooks**: Auto-run `keeper-tend --dry-run` on commit, warn if patterns found
- **CI integration**: Fail PR if new patterns not in seed vault
- **VS Code extension**: Highlight unseed patterns in editor

## References

- [keeper-spec.md](../keeper-spec.md) - Keeper of the Seeds specification
- [keeper-plant.md](../commands/keeper-plant.md) - Full discovery command
