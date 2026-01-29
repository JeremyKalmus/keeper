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

## Step 4: Launch Seed Analysis Sub-Agent

**CRITICAL**: Use a sub-agent to analyze seeds. This keeps full seed content
out of your context - you only receive the relevant patterns.

```
Use Task tool with subagent_type="general-purpose" and prompt:

"You are a Keeper seed analysis agent. Your job is to find RELEVANT patterns
for a specific feature and apply the Keeper decision matrices.

FEATURE TO ANALYZE:
<paste the feature description here>

KEEPER MODE: <mode from config.json>

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

3. For EACH need, check the seeds and apply the Four Questions:
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

5. Return a STRUCTURED RESPONSE with ONLY:

```yaml
analysis:
  feature: '<feature name>'
  mode: <seeding|growth|conservation>

  reuse:
    frontend:
      - name: <component>
        location: <path>
        reason: '<why this fits>'
    backend:
      - name: <route/service>
        location: <path>
        reason: '<why this fits>'
    data:
      - name: <type/enum>
        location: <path>
        reason: '<why this fits>'

  extensions:
    frontend:
      - component: <name>
        extension: '<what to add>'
        justification: '<why extend vs create>'
    backend:
      - route: <path>
        extension: '<what to add>'
    data:
      - type: <name>
        extension: '<what to add>'

  new_seeds_required:
    - type: <component|route|enum|service|type>
      name: <proposed name>
      justification: '<why nothing existing works>'

  forbidden:
    - '<pattern that must NOT be used>'

  recommendation: approved|rejected|deferred
  rationale: '<1-2 sentence explanation>'
```

IMPORTANT:
- Return ONLY the yaml block above - no extra commentary
- Include ONLY patterns relevant to this specific feature
- Do NOT include the full seed file contents
- Be conservative: prefer reuse over extension, extension over creation"
```

## Step 5: Process Sub-Agent Response

The sub-agent returns a structured analysis with only relevant patterns.
Use this to generate the final keeper_decision.

## Step 6: Generate keeper_decision

Determine the next decision ID:
```bash
ls .keeper/decisions/ 2>/dev/null | grep -E '^[0-9]+' | sort -n | tail -1
```

Create the decision in YAML format:

```yaml
keeper_decision:
  id: NNN
  date: YYYY-MM-DD
  feature: "<feature name>"
  mode: <seeding|growth|conservation>
  status: <approved|rejected|deferred>

  reuse:
    frontend:
      - <existing components to use>
    backend:
      - <existing routes/services to use>
    data:
      - <existing types/enums to use>

  extensions:
    frontend:
      <component>:
        add_variant: "<new variant>"
    backend:
      <route>:
        add_field: "<new field>"

  new_seeds:
    - type: <component|route|enum|service|type>
      name: <seed name>
      scope: <where it applies>
      justification: <why this cannot reuse existing>

  forbidden:
    - <patterns explicitly prohibited>

  constraints:
    - <specific implementation constraints>

  rationale: |
    <brief explanation of decision>
```

## Step 8: Save the Decision

Write to `.keeper/decisions/NNN-<feature-slug>.md`:

```markdown
# Keeper Decision: NNN - <Feature Name>

**Date**: YYYY-MM-DD
**Status**: APPROVED | REJECTED | DEFERRED
**Mode**: seeding | growth | conservation

## Summary

<One paragraph summary of the decision>

## Reuse Requirements

### Frontend
- <component>: Use existing, variant <X>

### Backend
- <route>: Extend with <field>

### Data
- <type>: Use existing

## Approved Extensions

<List of approved extensions with specifics>

## New Seeds (if any)

<List of approved new seeds with justification>

## Forbidden Patterns

- <pattern 1>
- <pattern 2>

## Constraints

- <constraint 1>
- <constraint 2>

## Rationale

<Detailed explanation of decision>

---

## keeper_decision (machine-readable)

\`\`\`yaml
<the full keeper_decision YAML>
\`\`\`
```

## Step 9: Report to User

Output:

```
KEEPER DECISION: [APPROVED|REJECTED|DEFERRED]

Feature: <feature name>
Mode: <mode>

Summary:
  Reuse: N existing patterns
  Extensions: N approved
  New Seeds: N approved
  Forbidden: N patterns

Decision saved: .keeper/decisions/NNN-<slug>.md

[If APPROVED]
You may proceed with implementation. Key constraints:
- REUSE: <list key components>
- FORBIDDEN: <list forbidden patterns>
- EXTENSIONS: <list approved extensions>

[If REJECTED]
Rejection reasons:
- <reason 1>
- <reason 2>

Suggestions:
- <how to modify the proposal to get approval>
```

## Critical Rules

- **Prefer reuse over extension**
- **Prefer extension over creation**
- **Reject if uncertain**
- You may approve NOTHING if existing patterns suffice
- A pattern must appear twice as an extension before promotion to new seed
- NEVER approve parallel implementations
- NEVER approve speculative abstractions
