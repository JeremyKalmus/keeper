# Keeper Prune - Redundancy Analysis & Consolidation Recommendations

**Status**: Implemented
**Author**: keeper/crew/max
**Date**: 2026-01-15

## Problem Statement

After running `/keeper-plant`, organizations often discover they have:
- Multiple similar components (Button, Btn, CustomButton, PrimaryButton)
- Overlapping services doing similar things
- Repeated patterns that could be shared utilities
- Technical debt from organic growth

Currently there's no systematic way to identify these consolidation opportunities.

## Goal

Add `/keeper-prune` - a read-only analysis command that:
1. Scans the seed vault and codebase for redundancy
2. Identifies consolidation opportunities
3. Outputs a **recommendation spec** (no code changes)
4. Recommendations can then feed into `/keeper-review` for implementation planning

**Key constraint**: Keepers document and govern, they don't code. `/keeper-prune` produces recommendations only.

## The Gardening Model (Updated)

| Command | Frequency | Purpose | Output |
|---------|-----------|---------|--------|
| `/keeper-plant` | Once (install) | Document what exists | Seed files |
| `/keeper-prune` | Periodic | Find redundancy | Recommendation spec |
| `/keeper-tend` | After work | Incremental updates | Seed updates |
| `/keeper-review` | Per feature | Gate new work | ADR |
| `/keeper-validate` | Per PR | Validate changes | Pass/fail |

## Analysis Categories

### 1. Component Duplication
Look for components with:
- Similar names (Button, Btn, ActionButton)
- Similar props/interfaces
- Similar DOM structure
- Overlapping functionality

**Output**: Recommend which to keep as canonical, which to deprecate

### 2. Service Overlap
Look for services that:
- Have similar method names
- Operate on same data types
- Could be merged or share a base class

**Output**: Recommend service consolidation or shared base

### 3. Utility Patterns
Look for repeated patterns that could be:
- Extracted to shared utilities
- Made into custom hooks
- Consolidated into helper functions

**Output**: Recommend utility extraction

### 4. Type/Enum Duplication
Look for:
- Similar type definitions
- Overlapping enums
- Redundant interfaces

**Output**: Recommend canonical types

### 5. API Route Overlap
Look for:
- Routes with similar purposes
- Inconsistent naming conventions
- Opportunities for REST consolidation

**Output**: Recommend API cleanup

## Output Format

`/keeper-prune` produces a recommendation spec at `keeper/recommendations/prune-YYYY-MM-DD.md`:

```markdown
# Keeper Prune Recommendations
Generated: 2026-01-15
Seed Vault Version: <commit>

## Executive Summary
- **High Priority**: 3 recommendations
- **Medium Priority**: 5 recommendations
- **Low Priority**: 8 recommendations
- **Estimated Impact**: ~15% reduction in component count

---

## High Priority Recommendations

### PRUNE-001: Consolidate Button Components
**Category**: Component Duplication
**Confidence**: High (92% similarity)

**Current State**:
- `src/ui/Button.tsx` - 45 usages
- `src/components/Btn.tsx` - 12 usages
- `src/shared/ActionButton.tsx` - 8 usages

**Recommendation**:
1. Keep `Button.tsx` as canonical (most usage, most complete)
2. Deprecate `Btn.tsx` - migrate 12 usages
3. Merge `ActionButton.tsx` variants into Button

**Migration Scope**: 20 files affected
**Risk**: Low - components are nearly identical

---

### PRUNE-002: Merge UserService and ProfileService
**Category**: Service Overlap
**Confidence**: Medium (67% method overlap)

**Current State**:
- `UserService`: getUser, updateUser, deleteUser
- `ProfileService`: getProfile, updateProfile, getUserPreferences

**Recommendation**:
Merge into single `UserService` with clear boundaries:
- User CRUD operations
- Profile/preferences as sub-resource

**Migration Scope**: 8 files affected
**Risk**: Medium - requires API consideration

---

## Medium Priority Recommendations
...

## Low Priority Recommendations
...

## Next Steps

To implement these recommendations:
1. Create a spec for each PRUNE-XXX item
2. Run `/keeper-review` on the spec
3. Assign to convoy for implementation

Example:
```
/keeper-review "Implement PRUNE-001: Consolidate Button components"
```
```

## Command Specification

```
/keeper-prune [options]

Options:
  --category <cat>     Only analyze specific category (components|services|types|routes)
  --threshold <n>      Similarity threshold % (default: 60)
  --output <path>      Custom output path (default: keeper/recommendations/)
  --json               Output as JSON for tooling

Examples:
  /keeper-prune                          # Full analysis
  /keeper-prune --category components    # Only component analysis
  /keeper-prune --threshold 80           # Only high-confidence matches
```

## Implementation Notes

### Parallel Agents
Like `/keeper-plant`, use parallel sub-agents to avoid context overflow:
- Agent 1: Component duplication analysis
- Agent 2: Service overlap analysis
- Agent 3: Utility pattern analysis
- Agent 4: Type/enum duplication analysis
- Agent 5: API route analysis

Each agent writes to a temp file, main agent compiles final report.

### Similarity Detection
Agents should look for:
- Name similarity (Levenshtein distance, common prefixes/suffixes)
- Structural similarity (similar props, methods, signatures)
- Behavioral similarity (similar implementations)

### Confidence Scoring
Each recommendation includes confidence:
- **High (80%+)**: Near-identical, safe to consolidate
- **Medium (60-80%)**: Similar, needs review
- **Low (40-60%)**: Possibly related, investigate

### Integration with Keeper Modes

| Mode | Behavior |
|------|----------|
| seeding | Run freely, all recommendations shown |
| growth | Run freely, prioritize high-confidence |
| conservation | Require explicit approval to run |

## Success Criteria

1. Identifies obvious duplicates with high confidence
2. Produces actionable recommendations (not just "these are similar")
3. Integrates with `/keeper-review` workflow
4. Runs in reasonable time (<2 minutes for medium codebase)
5. Does NOT modify any code

## Future Enhancements

- **Auto-link to Jira**: Create tickets for each recommendation
- **Trend tracking**: Compare prune reports over time
- **Debt scoring**: Quantify technical debt reduction
- **IDE integration**: Highlight prunable code in editor
