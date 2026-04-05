# Paddle Billing × FetchSandbox

Prove your Paddle integration works — subscription lifecycle, webhooks, state transitions, failure handling — without touching Paddle's production or sandbox environment.

## Quick Start (CLI)

```bash
# Install the CLI
npm install -g fetchsandbox

# Run the subscription lifecycle with execution proof
fetchsandbox run paddle subscription_lifecycle --prove
```

**Output:**

```
  ✓ Get trialing subscription
  ✓ Activate subscription        (trialing → active)
  ✓ Pause subscription           (active → paused)
  ✓ Resume subscription          (paused → active)
  ✓ Cancel subscription          (active → canceled)
  ✓ Verify final state
  ✓ 4/4 webhooks verified

  RECONCILIATION:
    ✓ status:      http=canceled  state=canceled  event=canceled
    ✓ customer_id: consistent across all 3 views
    ✓ currency:    consistent across all 3 views

  CONSTRAINTS:     1/1  (terminal state reached)
  EFFECTS:         2/2  (canceled fired, past_due absent)
  INVARIANTS:      2/2  (customer linkage, state↔webhook)
  FAILURE CLASSES: 1/1  (payment_failed: state held)

  PROOF COMPLETE
  3 fields | 1/1 constraints | 2/2 effects | 2/2 invariants | 1/1 failure classes
```

Zero signup. Zero API keys. Zero Paddle account needed.

## Quick Start (Code)

Run the demo app directly against FetchSandbox:

```bash
# Get sandbox credentials
fetchsandbox status paddle

# Run the integration demo
SANDBOX_URL=https://fetchsandbox.com \
  SANDBOX_ID=<from-status> \
  API_KEY=<from-status> \
  node demo.js
```

Or run it from this directory:

```bash
cd paddle && node demo.js
```

## What's Proven

### State Transitions
Every Paddle subscription state is exercised:
```
trialing → active → paused → active → canceled
```

### Webhook Verification
Each action fires the correct webhook event:
- `subscription.activated` — fired on activate
- `subscription.paused` — fired on pause
- `subscription.resumed` — fired on resume
- `subscription.canceled` — fired on cancel

### Three-View Reconciliation
After execution, three independent views of truth are compared:
- **HTTP response** — what the API caller sees
- **State store** — what persists internally
- **Webhook payload** — what external systems receive

All three must agree on `status`, `customer_id`, and `currency_code`.

### Invariants
- **Referential**: customer linkage preserved across all mutations
- **State↔Event consistency**: canceled state has a matching canceled webhook

### Failure Handling
Switches to `payment_failed` scenario and verifies:
- Subscription state does NOT advance
- No `subscription.activated` webhook fires
- System correctly rejects the operation

## Available Workflows

| Workflow | Steps | What it proves |
|----------|-------|---------------|
| `subscription_lifecycle` | 7 | Full state machine: trial → active → paused → active → canceled |
| `create_transaction` | 3 | Transaction creation + retrieval + webhook |
| `product_catalog_setup` | 3 | Product + price creation + verification |

Run all at once:
```bash
fetchsandbox run paddle --all
```

## Paddle API Coverage

| Resource | Endpoints | State Machine |
|----------|-----------|--------------|
| Subscriptions | 11 | trialing, active, past_due, paused, canceled |
| Transactions | 7 | draft, ready, billed, paid, completed, canceled, past_due |
| Customers | 7 | — |
| Products | 4 | active, archived |
| Prices | 4 | active, archived |
| Discounts | 4 | active, archived, expired, used |
| Adjustments | 3 | pending_approval, approved, rejected, reversed |
| **Total** | **87** | **5 state machines** |

## Error Scenarios

Test how your integration handles failures:

```bash
# Payment declined
fetchsandbox run paddle subscription_lifecycle --scenario payment_failed

# Auth failure (invalid token)
fetchsandbox run paddle subscription_lifecycle --scenario auth_failure

# Rate limiting
fetchsandbox run paddle subscription_lifecycle --scenario rate_limited
```

## For Paddle Integration Teams

This sandbox proves your integration handles:

1. **The happy path** — subscription lifecycle works end-to-end
2. **Webhook correctness** — right events fire at the right time
3. **State consistency** — API response, internal state, and webhook payload agree
4. **Failure resilience** — system behaves correctly when payments fail

Your integrators can validate all of this in minutes, not weeks.

---

Built with [FetchSandbox](https://fetchsandbox.com) — instant stateful API sandboxes from any OpenAPI spec.
