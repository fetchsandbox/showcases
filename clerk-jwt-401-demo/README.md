# Clerk JWT 401 demo — the 5-minute bug nobody catches

> The frontend signs in. The auth code looks correct. Every `.env` file looks correct on its own. But the server 401s on every authenticated request.

This demo reproduces one of the most painful bugs in agent-generated Clerk integrations — the cross-`.env` Clerk-instance mismatch — using the existing [`acme-checkout`](../acme-checkout) showcase.

## The bug, in one paragraph

The `pk_test_...` publishable key on the web side encodes the Clerk instance domain (e.g. `daring-narwhal-31.clerk.accounts.dev`). The `CLERK_JWT_ISSUER` URL on the server points at a different Clerk instance (e.g. `faithful-koala-77.clerk.accounts.dev`). Both `.env` files look correct on their own. The JWT signed by the frontend's instance won't verify against the server's JWKS endpoint. Every authenticated request 401s.

An agent reading either file in isolation sees nothing wrong. An agent reading both files still needs the structural knowledge to compare the instance domain in the publishable key with the issuer URL. **That knowledge has to come from somewhere.** FetchSandbox's [Clerk brain.yaml](https://github.com/fetchsandbox/sandbox/blob/main/backend/configs/clerk/brain.yaml) is that somewhere — it ships a blocker compliance note that flags this exact bug class to any agent calling the FetchSandbox MCP for Clerk.

---

## Setup the broken state (~3 minutes)

You'll need:
- The [acme-checkout](https://github.com/fetchsandbox/showcases/tree/main/acme-checkout) repo cloned + installed
- Two test-mode Clerk accounts OR one Clerk account with two separate "applications" inside it (Clerk dashboard → top-left dropdown → "Create application")

### Step 1. Create two Clerk applications

From https://dashboard.clerk.com, create:
- **App A** ("daring-narwhal-31" or whatever Clerk names it) — copy its `Publishable key`, `Secret key`, and grab its issuer URL from the JWT Templates page
- **App B** ("faithful-koala-77" or whatever) — same thing, but you'll only use its `CLERK_JWT_ISSUER`

### Step 2. Wire the bug into the env files

```bash
cd ~/showcases/acme-checkout
```

`web/.env.local` — use values from **App A**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_<App A's publishable>
CLERK_SECRET_KEY=sk_test_<App A's secret>
```

`server/.env` — use values from **App B**:
```
CLERK_JWT_ISSUER=https://<App B's instance>.clerk.accounts.dev
```

### Step 3. Run it

```bash
pnpm dev
```

Open http://localhost:3001 (web) → Sign in (uses App A) → Go to `/checkout` → Click "Pay $49.99" → **`POST /create-payment-intent` → 401**.

That's the bug. It looks like an auth code problem. It isn't.

---

## How to record the two takes

### Take A — Without FetchSandbox MCP (target: ~3 min)

1. Open `acme-checkout/` in Cursor. Either close all MCP servers OR open a fresh project window without `.mcp.json` enabled.
2. Reproduce the 401 in the browser.
3. Ask Cursor:
   > "I'm signed in via Clerk on the Next.js side but every call to /create-payment-intent on the FastAPI server returns 401. Help me debug."
4. Watch Cursor:
   - Read `server/main.py`'s JWT verification code
   - Suggest checking the `Authorization` header
   - Maybe suggest manually fetching the JWKS endpoint to debug
   - Likely take 5+ message turns before considering env consistency

5. Stop the clock at "checked `.env` files for consistency."

### Take B — With FetchSandbox MCP (target: ~30 seconds)

1. Same `acme-checkout/` repo with `.mcp.json` wired to FetchSandbox MCP.
2. Reproduce the 401.
3. Ask Cursor:
   > "I'm getting 401 on /create-payment-intent for a Clerk integration. Use FetchSandbox MCP to debug."
4. Watch FetchSandbox coach:
   - Pulls Clerk brain.yaml compliance notes
   - Surfaces the env-instance-mismatch blocker note ("All Clerk env vars must reference the SAME Clerk instance")
   - Cursor immediately checks the publishable key's encoded instance vs the JWT issuer URL
   - Finds the mismatch in under a minute

5. Stop the clock at "checked `.env` files for consistency."

The difference is **the wall-clock and the path**:
- Without FS: Cursor's first 3-5 hypotheses are about the code
- With FS: Cursor's first hypothesis is about env consistency, because the brain.yaml told it that's the #1 cause

---

## What to post (with proof artifacts)

> Quiet demo: agent debugging a Clerk JWT 401.
>
> Without FetchSandbox: Cursor goes to the auth code first. Reads JWT verification. Suggests rewriting. ~5 min before checking env consistency.
>
> With FetchSandbox: Cursor surfaces the Clerk env-instance-consistency compliance note in <30s. The bug is found before any code is read.
>
> These bugs live in the relationships between systems. Structured knowledge that catches them has to come from somewhere. We're building that somewhere.
>
> Brain.yaml: github.com/fetchsandbox/sandbox/blob/main/backend/configs/clerk/brain.yaml
>
> [Two screen captures]

---

## What's actually new in this demo

The compliance note that makes Take B work is **new as of [today]** — it's the blocker note at the bottom of `compliance_notes` in [`clerk/brain.yaml`](https://github.com/fetchsandbox/sandbox/blob/main/backend/configs/clerk/brain.yaml):

> **All Clerk env vars must reference the SAME Clerk instance.**
> The publishable key on the frontend encodes the instance domain. The secret key AND the JWT issuer URL must all belong to that same instance — otherwise the JWT signed by the frontend's instance won't verify against the server's JWKS, and every authenticated request returns 401.
>
> The trap: this is structurally invisible from any single file. Each `.env` looks correct on its own. The bug lives in the relationship between two files.

The compliance note has to be deployed to FetchSandbox prod before Take B can be recorded with real artifacts. If it's not on prod yet, the demo still illustrates the concept — you just can't say "ran this against fetchsandbox.com today and the coach surfaced it." With it on prod, you can.

---

## Related

- [`acme-checkout`](../acme-checkout) — the Stripe + Clerk + Resend showcase you'll be running this demo against
- [Clerk brain.yaml on GitHub](https://github.com/fetchsandbox/sandbox/blob/main/backend/configs/clerk/brain.yaml) — the structured knowledge that makes Take B work
- The original Jeff Escalante (Clerk Director of Engineering) X thread that prompted this demo
