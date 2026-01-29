---
description: Review a feature plan against the Seed Vault and produce a keeper_decision
allowed-tools: Read,Write,Glob,Bash(ls:*),Bash(date:*)
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

## Step 2: Load Configuration and Seeds

Read `.keeper/config.json` for current mode.

Read all seed files:
- `.keeper/seeds/frontend.yaml`
- `.keeper/seeds/backend.yaml`
- `.keeper/seeds/data.yaml`
- `.keeper/seeds/auth.yaml`

## Step 3: Parse the Feature Request

If $ARGUMENTS is a file path, read the file.
Otherwise, treat $ARGUMENTS as the feature description.

For the feature, identify ALL proposed:
- New UI components or component variants
- New API routes or route modifications
- New database fields, enums, or schema changes
- New auth patterns or permission scopes
- New services or utilities

## Step 4: Apply the Four Canonical Questions

For **EACH** proposed element, answer:

### Question 1: What already exists?

Check the relevant seed file. List any matching or similar patterns:
- Same name?
- Similar purpose?
- Overlapping functionality?

### Question 2: Is it sufficient?

Does the existing pattern cover the use case?
- If **yes**: Use it. Stop here for this element.
- If **no**: Continue to Question 3.

### Question 3: What is the smallest extension?

Can the existing pattern be extended?
- Add a variant?
- Add a field?
- Add a method?

Prefer extension over creation. Document the minimal change.

### Question 4: If a new seed is required, how is it preserved?

If nothing exists and no extension works:
- Justify why this is truly new
- Define how it will be documented in seeds
- Consider if this should be local-only (not promoted to seed)

## Step 5: Apply Decision Matrices

### Frontend Components

| Question | Yes | No |
|----------|-----|----|
| Component exists in seeds? | Use it | Continue |
| Variant fits use case? | Use variant | Extend variant |
| Extension breaks design system? | **REJECT** | Approve |

### API Routes

| Question | Yes | No |
|----------|-----|----|
| Route exists with same resource? | Extend | Continue |
| Extension is backward-compatible? | Modify | New route |
| New route matches REST conventions? | Approve | **REJECT** |

### Database/Types

| Question | Yes | No |
|----------|-----|----|
| Type/enum exists in seeds? | Extend | Continue |
| Extension append-only (enums)? | OK | **REJECT** |
| New type scoped appropriately? | Approve | Make global |

### Auth

| Question | Yes | No |
|----------|-----|----|
| Auth pattern exists in seeds? | Use it | **BLOCK** |
| New permission required? | Add scope | Reject new role |

## Step 6: Consider Keeper Mode

Adjust strictness based on mode from config.json:

- **seeding**: Allow new seeds freely, warn instead of block
- **growth**: Reuse-first, extensions preferred, new seeds need justification
- **conservation**: New seeds almost always rejected

## Step 7: Generate keeper_decision

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
