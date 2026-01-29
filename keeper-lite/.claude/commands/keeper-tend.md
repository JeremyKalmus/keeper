---
description: Check for undocumented patterns in recently modified files
allowed-tools: Read,Write,Glob,Grep,Bash(ls:*),Bash(find:*),Bash(date:*),Bash(git:*)
argument-hint: [--days N] [--mode seeding|growth]
---

# Keeper Tend

You are the **Keeper of the Seeds** performing incremental maintenance.

Unlike `/keeper-plant` (full discovery), this command checks **only recent changes** for patterns that should be documented in the Seed Vault.

**Arguments**: $ARGUMENTS

## Step 1: Verify Initialization

```bash
ls .keeper/config.json 2>/dev/null
```

If not found, abort with:
```
ERROR: Keeper not initialized. Run /keeper-init first.
```

## Step 2: Load Configuration

Read `.keeper/config.json` for current mode.
If `--mode` argument provided, use that instead.

Parse `--days N` from arguments. Default to 7 days.

## Step 3: Determine Change Detection Method

Check if git is available:

```bash
git rev-parse --git-dir 2>/dev/null
```

### If Git Available

Use git to find recently changed files:

```bash
git diff --name-only HEAD~20 -- '*.ts' '*.tsx' '*.js' '*.jsx' 2>/dev/null | head -50
```

Or by date:
```bash
git log --oneline --since="7 days ago" --name-only | grep -E '\.(ts|tsx|js|jsx)$' | sort -u | head -50
```

### If No Git (OneDrive/Local)

Fall back to file modification times using `find`:

```bash
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -mtime -7 2>/dev/null | grep -v node_modules | grep -v .keeper | head -50
```

Where `-mtime -7` means modified in last 7 days. Adjust based on `--days` argument.

## Step 4: Load Current Seeds

Read all seed files and build inventory of documented patterns:

- `.keeper/seeds/frontend.yaml` → components, hooks, stores
- `.keeper/seeds/backend.yaml` → routes, services
- `.keeper/seeds/data.yaml` → types, enums, schemas
- `.keeper/seeds/auth.yaml` → auth patterns

## Step 5: Scan Changed Files for Patterns

For each changed file, check for seedable patterns:

### Component Pattern (tsx/jsx files)
Look for: `export (default )?function \w+` or `export const \w+ =`

### Hook Pattern
Look for: `export function use\w+`

### Enum Pattern
Look for: `enum \w+` or `type \w+ =` with union literals

### Service Pattern
Look for: `class \w+Service` or `Service =`

### Route Pattern
Look for: `GET|POST|PUT|DELETE|PATCH` handlers

## Step 6: Cross-Reference with Seeds

For each detected pattern:
1. Check if it exists in the corresponding seed file
2. If not found, mark as **undocumented**

## Step 7: Generate Report

```
KEEPER TEND: <date>

Detection method: <git|file timestamps>
Scanned: N files modified in last D days
Mode: <seeding|growth|conservation>

─────────────────────────────────────
UNDOCUMENTED PATTERNS FOUND
─────────────────────────────────────

Frontend:
  [x] NewComponent (src/ui/NewComponent.tsx)
      Type: component
      Last modified: <date>
  [x] useNewHook (src/hooks/useNewHook.ts)
      Type: hook
      Last modified: <date>

Backend:
  [x] /api/new-route (src/api/new-route.ts)
      Methods: POST, GET
      Last modified: <date>

Data:
  [x] NewEnum (src/types/enums.ts)
      Values: VALUE_A, VALUE_B
      Last modified: <date>

Already Documented: N patterns (not shown)

─────────────────────────────────────
```

## Step 8: Take Action Based on Mode

### Seeding Mode

Auto-add undocumented patterns to seed files:

```yaml
  NewComponent:  # auto-added by keeper-tend <date>
    location: path/to/file.tsx
    variants: [default]
    when_to_use: "TODO: describe usage"
```

Report:
```
ADDED to seeds:
  - NewComponent → frontend.yaml
  - useNewHook → frontend.yaml
  - NewEnum → data.yaml

Review .keeper/seeds/*.yaml and complete TODO descriptions.
```

### Growth/Conservation Mode

Do NOT auto-add. Instead suggest:

```
SUGGESTED ADDITIONS (manual review required):

1. Add to .keeper/seeds/frontend.yaml:
   NewComponent:
     location: src/ui/NewComponent.tsx
     variants: [default]
     when_to_use: "TODO"

2. Add to .keeper/seeds/data.yaml:
   NewEnum:
     values: [VALUE_A, VALUE_B]
     location: src/types/enums.ts
     append_only: true
     when_to_use: "TODO"

To add these patterns, either:
- Run /keeper-tend --mode seeding to auto-add
- Manually edit the seed files
- Run /keeper-plant for full rediscovery
```

## Step 9: Update Last Tend Timestamp

Update `.keeper/config.json` with last tend date:

```json
{
  "keeper": {
    "mode": "growth",
    "last_tend": "2024-01-15T10:30:00Z"
  }
}
```

## Step 10: Summary

```
KEEPER TEND COMPLETE

Files scanned: N
Undocumented patterns: N
[Seeding: Added to vault | Growth: Suggestions above]

Tip: Run /keeper-tend regularly to keep seeds current.
     Run /keeper-plant for full codebase discovery.
     Run /keeper-review before implementing new features.
```

## Performance Notes

- This command should complete quickly (< 30 seconds)
- Uses file timestamps when git unavailable
- Limits scan to recent changes only
- Run weekly or after major development sprints
- Use `/keeper-plant` for comprehensive discovery
