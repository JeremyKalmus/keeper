⸻

Keeper of the Seeds (KoS)

Purpose:
Prevent architectural drift by enforcing reuse, consistency, and deliberate evolution across UI, API, data, and auth before any polecat is unleashed.

Authority level:
Hard gate. Convoys do not launch without KoS approval.

⸻

1. Canonical Responsibilities

The Keeper of the Seeds must answer exactly four questions for every feature:
	1.	What already exists?
	2.	Is it sufficient?
	3.	If not, what is the smallest extension?
	4.	If a new seed is required, how is it preserved?

This applies uniformly to:
	•	Frontend components
	•	API routes
	•	Database schemas & enums
	•	Auth patterns
	•	Event/state models

⸻

2. The Seed Vault (single source of truth)

Create a structured registry (machine-readable, not prose):

/seeds/
  frontend.yaml
  backend.yaml
  data.yaml
  auth.yaml

Example: frontend.yaml

components:
  Button:
    variants: [primary, secondary, danger]
    location: src/ui/Button.tsx
    when_to_use: "Any clickable action"
    forbidden_extensions:
      - custom colors
  Modal:
    location: src/ui/Modal.tsx
    when_to_use: "Blocking user decisions"

Example: backend.yaml

api_routes:
  POST /auth/login:
    purpose: "User authentication"
    auth_required: false

  GET /users/:id:
    purpose: "User profile retrieval"
    auth_required: true

services:
  AuthService:
    responsibilities:
      - token issuance
      - token validation

Example: data.yaml

enums:
  user_status:
    values: [active, suspended, deleted]
    extension_policy: "append-only"

tables:
  users:
    primary_key: id
    enum_fields:
      - user_status

Polecats do not interpret this.
The Keeper does.

⸻

3. Decision Matrix (this is the heart of it)

The Keeper outputs a deterministic decision using this matrix.

⸻

A. Frontend Components

Question	Yes	No
Component exists?	Use it	Continue
Variant fits use case?	Use variant	Extend variant
Extension breaks design system?	❌ Reject	Approve
Extension reused ≥2 times?	Promote to core	Local only


⸻

B. API Routes

Question	Yes	No
Route exists with same resource?	Extend	Continue
Extension is backward-compatible?	Modify	New route
New route matches REST shape?	Approve	❌ Reject
Auth model consistent?	Proceed	Fix auth


⸻

C. Database Enums / Fields

Question	Yes	No
Enum exists?	Extend	Continue
Extension append-only?	OK	❌ Reject
New enum scoped to one table?	Approve	Global enum
Requires migration?	Generate plan	❌ Block


⸻

D. Auth / Identity

Question	Yes	No
Auth service exists?	Use it	❌ Block
New permission required?	Add scope	Reject new role
Token shape consistent?	Proceed	❌ Reject


⸻

4. Keeper Output (machine-consumable, binding)

The Keeper of the Seeds produces exactly one artifact:

keeper_decision:
  status: approved
  reuse:
    frontend:
      - Button.primary
      - Modal
    backend:
      - POST /auth/login
      - AuthService
    data:
      - enum:user_status
  extensions:
    frontend:
      Button:
        add_variant: "warning"
    backend:
      GET /users/:id:
        add_field: "last_login"
  new_seeds:
    - type: enum
      name: feature_state
      scope: table:features
  forbidden:
    - new auth services
    - new modal implementations

This file becomes immutable input for all convoys.

If a polecat violates it → output is rejected automatically.

⸻

5. Keeper Prompt (critical detail)

The Keeper must be conservative, not creative.

Key prompt clauses:
	•	“Prefer reuse over extension.”
	•	“Prefer extension over creation.”
	•	“Reject if uncertain.”
	•	“You are accountable for long-term system coherence.”

This is not a “helpful” agent.
It is a librarian with veto power.

⸻

6. Why this works better than generic design review

Traditional Review	Keeper of the Seeds
Opinionated	Deterministic
Human-readable	Machine-enforced
Post-hoc	Pre-flight
Contextual	Canonical

It transforms architecture from culture into infrastructure.

⸻

7. Mad Max theming (optional but useful)

You can lean into this without harming clarity:
	•	Seeds = reusable primitives
	•	Vault = registries
	•	Keeper = reviewer
	•	Wasteland = forbidden patterns
	•	Scavenging = reuse discovery

This actually helps agents stay in character and follow constraints.

⸻

8. One subtle but important rule

The Keeper may approve nothing.

“No new seeds. Use existing patterns only.”

This single rule prevents 80% of architectural drift.

⸻

9. Scope: where Keepers live

✅ Keeper of the Seeds lives at the rig (project) level

Reason:
	•	Patterns are project-specific
	•	Frontend systems, APIs, auth models differ per rig
	•	Reuse across rigs is aspirational, not enforceable

So every rig has:

/rigs/<rig-name>/
  /seeds/
  keeper.yaml
  decisions/

The Keeper:
	•	Only governs within that rig
	•	Has veto power only there
	•	Never assumes global truths

⸻

But: you still need one thing above rigs

Without this, every new project starts from chaos.

⸻

10. Introduce the Great Seed Vault (user-level)

This lives at the Gastown root:

/gastown/
  /great-seeds/
    frontend.yaml
    backend.yaml
    data.yaml
    auth.yaml

This is:
	•	Optional
	•	Advisory
	•	Read-only

Think of it as:

“Patterns that have survived other wastelands”

The Keeper may import from it, but is not forced to.

⸻

11. Brand new project: the Founding Ritual

A brand new rig does not start with a Keeper.

It starts with a Founding Convoy.

⸻

A. Founding Convoy (one-time per rig)

This convoy has 3 roles:

1. Cartographer
	•	Defines domain boundaries
	•	Identifies core entities
	•	Sketches data model
	•	No code

2. Seed Planter
	•	Proposes:
	•	Initial frontend components
	•	Initial API routes
	•	Initial enums / schemas
	•	Auth model
	•	Must justify why each seed is foundational

3. First Keeper of the Seeds
	•	Reviews Seed Planter output
	•	Rejects anything premature
	•	Produces the Initial Seed Vault

⸻

B. Output of Founding Convoy

rig_status: seeded

initial_seeds:
  frontend:
    - Button
    - Input
    - Modal
  backend:
    - AuthService
    - UserService
  data:
    - users
    - user_status enum
  auth:
    - jwt
    - role_scopes

Once this exists:
	•	The Keeper is now active
	•	All future convoys must pass through it

⸻

12. How new patterns are added later (controlled evolution)

This is where most systems fail — so be strict.

⸻

A. Two paths to new seeds

Path 1: Emergence (preferred)

Rule:

A pattern must appear at least twice as an extension before promotion.

Flow:
	1.	Feature A extends existing pattern
	2.	Feature B extends same pattern
	3.	Keeper promotes extension → new seed

This prevents speculative abstractions.

⸻

Path 2: Explicit Proposal (rare, heavy)

For foundational changes:
	•	New auth model
	•	New data paradigm
	•	New UI framework

Requires a Seed Proposal Convoy:
	•	Justification
	•	Migration plan
	•	Rollback strategy

Default outcome: rejection

⸻

B. Keeper decision example

new_seed_request:
  type: frontend_component
  name: Timeline

keeper_decision:
  status: deferred
  reason: "Only one usage; inline extension approved"

This keeps the system lean.

⸻

13. What the Keeper does in early-stage projects

Important nuance: early rigs need flexibility, not bureaucracy.

So the Keeper operates in modes.

⸻

Keeper Modes

🌱 Seeding Mode (early project)
	•	Allows new seeds freely
	•	Still records them
	•	Warns instead of blocks

🌿 Growth Mode (default)
	•	Reuse-first
	•	Extension preferred
	•	New seeds gated

🌳 Conservation Mode (mature project)
	•	New seeds almost always rejected
	•	Focus on stability

Mode lives in:

keeper:
  mode: growth

This single flag solves the “early rigidity” problem.

⸻

14. Cross-rig learning (optional, powerful)

Once multiple rigs exist, you can:
	•	Periodically promote seeds to Great Seed Vault
	•	Mark them:

proven_in:
  - rig-a
  - rig-b



Future rigs can import these intentionally, not accidentally.

⸻

15. Why this scales cleanly

Concern	Answer
Multiple rigs	Isolated Keepers
New projects	Founding Convoy
Early exploration	Seeding Mode
Long-term entropy	Conservation Mode
Knowledge reuse	Great Seed Vault

No central brain.
No hidden state.
No vibes.

⸻

16. One rule to tattoo on this system

No Keeper, no convoy.
No seeds, no Keeper.

That ordering matters.

⸻
