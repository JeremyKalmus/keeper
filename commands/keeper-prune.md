---
description: Analyze codebase for redundancy and generate consolidation recommendations (read-only)
allowed-tools: Read,Write,Glob,Grep,Bash(find:*),Bash(ls:*),Bash(cat:*),Bash(date:*),Task
argument-hint: [--category components|services|types|routes] [--threshold N]
---

# Keeper Prune - Redundancy Analysis

You are the **Keeper of the Seeds** performing pruning analysis.

This command analyzes the codebase for redundancy and generates consolidation recommendations.
**This is READ-ONLY** - no code changes, only documentation.

**Arguments**: $ARGUMENTS

## Step 1: Verify Seeds Exist

Check that `/keeper-plant` has been run:
```bash
ls keeper/seeds/*.yaml 2>/dev/null | wc -l
```

If no seeds found, abort with:
```
ERROR: Seed vault is empty. Run /keeper-plant first to document existing patterns.
```

## Step 2: Parse Arguments

- `--category`: Limit to specific category (components, services, types, routes)
- `--threshold`: Similarity threshold percentage (default: 60)

## Step 3: Create Output Directory

```bash
mkdir -p keeper/recommendations
date +%Y-%m-%d
```

## Step 4: Launch Parallel Analysis Agents

Spawn 5 parallel sub-agents using Task tool. Each agent:
1. Analyzes one category for redundancy
2. Writes findings to a temp file
3. Returns only a brief summary

Launch ALL agents in a SINGLE message:

### Agent 1: Component Duplication Analysis
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper pruning agent analyzing COMPONENT DUPLICATION.

TASK:
1. Read keeper/seeds/frontend.yaml for documented components
2. Search codebase for component files (*.tsx, *.jsx, *.vue, *.svelte)
3. Identify potential duplicates by looking for:
   - Similar names (Button/Btn, Modal/Dialog, Card/Panel)
   - Similar file sizes and structures
   - Components in different directories doing same thing
4. For each potential duplicate set:
   - Note file locations and usage counts (grep for imports)
   - Assess similarity (High/Medium/Low)
   - Recommend which to keep as canonical
5. Write findings to keeper/recommendations/.prune-components.tmp
   Format as markdown sections for each duplicate set
6. Return ONLY a summary like:
   'Components: 3 duplicate sets found (2 high, 1 medium confidence)'

Do NOT return full analysis - write to file. Do NOT modify any code."
```

### Agent 2: Service Overlap Analysis
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper pruning agent analyzing SERVICE OVERLAP.

TASK:
1. Read keeper/seeds/backend.yaml for documented services
2. Search for service files (*Service.ts, *Service.js, services/*.ts)
3. Identify overlapping services by looking for:
   - Similar method names across services
   - Services operating on same data types
   - Duplicate functionality
4. For each overlap:
   - List the services and their methods
   - Identify shared functionality
   - Recommend consolidation approach
5. Write findings to keeper/recommendations/.prune-services.tmp
6. Return ONLY a summary like:
   'Services: 2 overlaps found (1 high, 1 medium confidence)'

Do NOT return full analysis - write to file. Do NOT modify any code."
```

### Agent 3: Utility Pattern Analysis
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper pruning agent analyzing REPEATED UTILITY PATTERNS.

TASK:
1. Search for common utility patterns repeated across files:
   - Date formatting logic
   - String manipulation
   - Validation helpers
   - API call wrappers
   - Error handling patterns
2. Look for similar functions in different files
3. Identify opportunities to extract shared utilities
4. For each pattern:
   - List locations where it appears
   - Suggest utility name and location
5. Write findings to keeper/recommendations/.prune-utilities.tmp
6. Return ONLY a summary like:
   'Utilities: 4 extraction opportunities found'

Do NOT return full analysis - write to file. Do NOT modify any code."
```

### Agent 4: Type/Enum Duplication Analysis
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper pruning agent analyzing TYPE AND ENUM DUPLICATION.

TASK:
1. Read keeper/seeds/data.yaml for documented types/enums
2. Search for type definitions (types/*.ts, *.d.ts, interfaces)
3. Identify duplicates by looking for:
   - Similar type names
   - Overlapping interfaces
   - Duplicate enum definitions
   - Same type defined in multiple places
4. For each duplicate:
   - List all locations
   - Recommend canonical location
5. Write findings to keeper/recommendations/.prune-types.tmp
6. Return ONLY a summary like:
   'Types: 5 duplicates found (3 enums, 2 interfaces)'

Do NOT return full analysis - write to file. Do NOT modify any code."
```

### Agent 5: API Route Analysis
```
Use Task tool with subagent_type="general-purpose" and prompt:
"You are a Keeper pruning agent analyzing API ROUTE REDUNDANCY.

TASK:
1. Read keeper/seeds/backend.yaml for documented routes
2. Search for route definitions (routes/*.ts, api/*.ts, pages/api/*)
3. Identify issues:
   - Overlapping endpoints (GET /user vs GET /users/:id/profile)
   - Inconsistent naming conventions
   - Duplicate functionality across routes
4. For each issue:
   - List the routes involved
   - Recommend consolidation or naming fix
5. Write findings to keeper/recommendations/.prune-routes.tmp
6. Return ONLY a summary like:
   'Routes: 2 overlaps, 3 naming inconsistencies'

Do NOT return full analysis - write to file. Do NOT modify any code."
```

## Step 5: Compile Recommendations

After all agents complete, compile the final report:

1. Read each temp file:
   - keeper/recommendations/.prune-components.tmp
   - keeper/recommendations/.prune-services.tmp
   - keeper/recommendations/.prune-utilities.tmp
   - keeper/recommendations/.prune-types.tmp
   - keeper/recommendations/.prune-routes.tmp

2. Assign priority to each recommendation:
   - **High**: Clear duplicates, easy wins
   - **Medium**: Requires some refactoring
   - **Low**: Nice to have, complex changes

3. Assign PRUNE-XXX IDs to each recommendation

4. Write final report to `keeper/recommendations/prune-YYYY-MM-DD.md`:

```markdown
# Keeper Prune Recommendations
Generated: <date>
Analyzed: <codebase name>

## Executive Summary
- **High Priority**: X recommendations
- **Medium Priority**: Y recommendations
- **Low Priority**: Z recommendations

---

## High Priority Recommendations

### PRUNE-001: <title>
**Category**: <Component Duplication|Service Overlap|etc>
**Confidence**: <High|Medium|Low>

**Current State**:
<what exists now>

**Recommendation**:
<what to do>

**Migration Scope**: X files affected
**Risk**: <Low|Medium|High>

---

<repeat for each recommendation>

## Next Steps

To implement these recommendations:
1. Create a spec for each PRUNE-XXX item you want to address
2. Run `/keeper-review` on the spec
3. Assign to convoy for implementation

Example:
\`\`\`
/keeper-review "Implement PRUNE-001: <title>"
\`\`\`
```

5. Clean up temp files:
```bash
rm -f keeper/recommendations/.prune-*.tmp
```

## Step 6: Output Summary

```
KEEPER PRUNE: COMPLETE

Analysis Date: <date>
Recommendations: keeper/recommendations/prune-<date>.md

Summary:
  Components: <agent 1 summary>
  Services: <agent 2 summary>
  Utilities: <agent 3 summary>
  Types: <agent 4 summary>
  Routes: <agent 5 summary>

Total: X high priority, Y medium, Z low

Next: Review recommendations and run /keeper-review on items to implement.
```

## Important Notes

- **Read-only**: This command NEVER modifies code
- **Recommendations only**: Output is documentation, not implementation
- **Seeds required**: Run /keeper-plant first
- **Integrate with workflow**: Feed recommendations into /keeper-review
- **Periodic running**: Re-run after major development phases
- **Human judgment**: Recommendations need review - not all duplicates should be merged
