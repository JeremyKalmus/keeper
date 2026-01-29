---
description: Check for undocumented patterns in recently modified files using a sub-agent
allowed-tools: Read,Write,Glob,Grep,Bash(ls:*),Bash(find:*),Bash(date:*),Bash(git:*),Task
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

## Step 3: Find Recently Changed Files

Check if git is available:

```bash
git rev-parse --git-dir 2>/dev/null
```

### If Git Available

```bash
git diff --name-only HEAD~20 -- '*.ts' '*.tsx' '*.js' '*.jsx' 2>/dev/null | head -50
```

### If No Git (OneDrive/Local)

```bash
find . \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -mtime -7 2>/dev/null | grep -v node_modules | grep -v .keeper | head -50
```

**Collect the list of changed files** - you'll pass this to the sub-agent.

## Step 4: Launch Tend Sub-Agent

**CRITICAL**: Use a sub-agent to analyze changed files against seeds.
This keeps seed content out of your context.

```
Use Task tool with subagent_type="general-purpose" and prompt:

"You are a Keeper tend agent. Your job is to find UNDOCUMENTED patterns
in recently changed files by comparing against the seed vault.

CHANGED FILES:
<paste the list of changed files here>

KEEPER MODE: <mode from config>

TASK:
1. Read ALL seed files to know what's already documented:
   - .keeper/seeds/frontend.yaml
   - .keeper/seeds/backend.yaml
   - .keeper/seeds/data.yaml
   - .keeper/seeds/auth.yaml

2. For EACH changed file, scan for patterns:
   - Components: export function/const ComponentName
   - Hooks: export function useXxx
   - Enums: enum EnumName or type X = 'a' | 'b'
   - Services: class XxxService
   - Routes: GET/POST/PUT/DELETE handlers

3. Cross-reference with seeds:
   - If pattern exists in seeds → Already documented (skip)
   - If pattern NOT in seeds → Undocumented (report it)

4. Return a STRUCTURED RESPONSE:

```yaml
tend_report:
  detection_method: <git|file_timestamps>
  files_scanned: <N>
  mode: <seeding|growth|conservation>

  undocumented:
    frontend:
      - name: <ComponentName>
        type: component|hook|store
        location: <file path>
      - name: <useHookName>
        type: hook
        location: <file path>
    backend:
      - name: <route or service>
        type: route|service
        location: <file path>
        methods: [GET, POST]  # if route
    data:
      - name: <TypeName>
        type: enum|type|schema
        location: <file path>
        values: [A, B]  # if enum
    auth:
      - name: <pattern>
        type: scope|role|middleware
        location: <file path>

  already_documented: <N patterns skipped>
```

IMPORTANT:
- Return ONLY the yaml block above
- Do NOT include already-documented patterns in detail
- Only report patterns that are MISSING from seeds"
```

## Step 5: Process Sub-Agent Response

The sub-agent returns only undocumented patterns. Use this to:

### Seeding Mode

Auto-add undocumented patterns to seed files. For each pattern:
- Add to appropriate seed file with `# auto-added by keeper-tend`
- Set `when_to_use: "TODO: describe usage"`

### Growth/Conservation Mode

Output suggestions but do NOT auto-add:

```
SUGGESTED ADDITIONS (manual review required):

1. Add to .keeper/seeds/frontend.yaml:
   ComponentName:
     location: src/ui/Component.tsx
     variants: [default]
     when_to_use: "TODO"

To add: Run /keeper-tend --mode seeding or edit manually.
```

## Step 6: Update Last Tend Timestamp

Update `.keeper/config.json`:
```json
{
  "keeper": {
    "last_tend": "2024-01-15T10:30:00Z"
  }
}
```

## Step 7: Summary

```
KEEPER TEND COMPLETE

Detection: <git|file timestamps>
Files scanned: N
Undocumented patterns: N
[Seeding: Added to vault | Growth: Suggestions above]

Next: Review .keeper/seeds/*.yaml
      Run /keeper-review before implementing new features
```

## Performance Notes

- Uses sub-agent to keep your context clean
- Limits scan to recent changes only
- Run weekly or after development sprints
