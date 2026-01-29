---
description: Review a feature plan against the Seed Vault using a sub-agent
allowed-tools: Read,Write,Glob,Bash(ls:*),Bash(date:*),Task
argument-hint: <feature description or spec file path>
---

# Keeper Review

You are now acting as the **Keeper of the Seeds** - a conservative librarian with veto power.

**Input**: $ARGUMENTS

## Step 1: Verify Initialization

```bash
ls .keeper/seeds/*.yaml 2>/dev/null | wc -l
```

If no seeds found, abort with:
```
ERROR: Seed vault is empty. Run /keeper-init and /keeper-plant first.
```

## Step 2: Load Configuration

Read `.keeper/config.json` for current mode (seeding/growth/conservation).

## Step 3: Parse the Feature Request

If $ARGUMENTS is a file path, read the file.
Otherwise, treat $ARGUMENTS as the feature description.

Note the feature description - you'll pass this to the sub-agent.

## Step 4: Determine Next Decision ID

```bash
ls .keeper/decisions/ 2>/dev/null | grep -E '^[0-9]+' | sort -n | tail -1
```

Calculate the next ID (e.g., if last was 002, next is 003).
Create a slug from the feature name (e.g., "user-profile-editing").

## Step 5: Launch Keeper Review Sub-Agent

**CRITICAL**: The sub-agent does ALL the work:
1. Reads all seed files
2. Analyzes the feature
3. **Writes the decision file directly**
4. Returns only a brief summary

You just read the result and report to the user.

```
Use Task tool with subagent_type="general-purpose" and prompt:

"You are a Keeper review agent. Your job is to analyze a feature against
the seed vault and WRITE the keeper_decision file directly.

FEATURE TO ANALYZE:
<paste the feature description here>

KEEPER MODE: <mode from config.json>
DECISION ID: <next ID, e.g., 003>
DECISION FILE: .keeper/decisions/<ID>-<slug>.md

TASK:

1. Read ALL seed files:
   - .keeper/seeds/frontend.yaml
   - .keeper/seeds/backend.yaml
   - .keeper/seeds/data.yaml
   - .keeper/seeds/auth.yaml

2. Identify what the feature NEEDS:
   - UI components required
   - API routes required
   - Data types/enums required
   - Auth patterns required

3. For EACH need, apply the Four Questions:
   Q1: What already exists? (check seeds)
   Q2: Is it sufficient? (does it cover the use case?)
   Q3: If not, what's the smallest extension?
   Q4: If new seed required, justify why

4. Apply Decision Matrices:

   Frontend:
   - Component exists? → Use it
   - Variant fits? → Use variant
   - Need extension? → Extend (reject if breaks design system)

   Backend:
   - Route exists for resource? → Extend it
   - Backward compatible? → Modify (else new route)
   - Matches REST? → Approve (else reject)

   Data:
   - Type/enum exists? → Extend it
   - Enum extension append-only? → OK (else reject)

   Auth:
   - Auth pattern exists? → Use it (else BLOCK)
   - New permission? → Add scope (reject new roles)

5. Determine status: approved | rejected | deferred

6. WRITE the decision file to: .keeper/decisions/<ID>-<slug>.md

   Use this format:

   ```markdown
   # Keeper Decision: <ID> - <Feature Name>

   **Date**: <today's date YYYY-MM-DD>
   **Status**: APPROVED | REJECTED | DEFERRED
   **Mode**: <mode>
   **Feature**: <feature description>

   ## Summary

   <1-2 sentence summary of decision>

   ## Reuse (existing patterns to use)

   ### Frontend
   - <component>: <why it fits>

   ### Backend
   - <route/service>: <why it fits>

   ### Data
   - <type/enum>: <why it fits>

   ## Extensions (approved modifications)

   - <component/route>: <what to add>

   ## New Seeds (if any)

   - <name>: <justification why nothing existing works>

   ## Forbidden

   - <pattern that must NOT be used>

   ## Constraints

   - <specific implementation constraint>

   ---

   ## keeper_decision (machine-readable)

   ```yaml
   keeper_decision:
     id: <ID>
     date: <YYYY-MM-DD>
     feature: '<feature>'
     mode: <mode>
     status: <approved|rejected|deferred>
     reuse:
       frontend: [<components>]
       backend: [<routes/services>]
       data: [<types/enums>]
     extensions:
       - target: <component/route>
         add: <what to add>
     new_seeds:
       - type: <component|route|enum|type>
         name: <name>
         justification: <why>
     forbidden:
       - <pattern>
     rationale: |
       <explanation>
   ```
   ```

7. Return ONLY a brief summary:
   'Decision <ID> written to .keeper/decisions/<ID>-<slug>.md
    Status: APPROVED|REJECTED|DEFERRED
    Reuse: N patterns, Extensions: N, New seeds: N, Forbidden: N'

IMPORTANT:
- WRITE the decision file directly - do not return full content
- Be conservative: prefer reuse > extension > creation
- Include ONLY patterns relevant to this feature"
```

## Step 6: Read and Report the Decision

The sub-agent wrote the decision file. Now:

1. **Read the decision file** the sub-agent created
2. **Extract key info** for the user (status, reuse count, forbidden patterns)
3. **Report** a concise summary

Output format:

```
KEEPER DECISION: [APPROVED|REJECTED|DEFERRED]

Feature: <feature name>
Decision: .keeper/decisions/<ID>-<slug>.md

Summary:
  Reuse: N existing patterns
  Extensions: N approved
  New Seeds: N approved
  Forbidden: N patterns

[If APPROVED]
You may proceed. Key constraints from the decision:
- REUSE: <list key components to use>
- FORBIDDEN: <list patterns to avoid>

[If REJECTED]
See decision file for details and suggestions.
```

## Important

- The **sub-agent does all the heavy lifting** (reads seeds, analyzes, writes decision)
- You only **read the result and report** to keep your context clean
- The decision file is the source of truth - direct the user to read it for details
