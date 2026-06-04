# Acme Checkout — Stripe + Clerk + Resend receipts

A complete checkout flow you can run locally:

- **Next.js** storefront with **Stripe Elements** for the payment form
- **Clerk** for sign-in
- **FastAPI** backend that verifies the Stripe webhook and sends a Resend receipt email

This is the demo we used to evaluate the FetchSandbox MCP integration coach. The Resend integration was added live with Claude + the FetchSandbox MCP — that part is up to you to redo (see [Try the FetchSandbox MCP flow](#try-the-fetchsandbox-mcp-flow) at the end).

---

## What you'll see at the end

1. Sign in with Clerk
2. Pay `$49.99` with the Stripe test card `4242 4242 4242 4242`
3. **A real receipt email lands in your inbox**

The whole flow takes ~3 minutes to set up once you have the keys.

---

## Prerequisites

- **Node.js** 20+ and **pnpm** (`npm install -g pnpm`)
- **Python** 3.11+
- **Stripe CLI** for webhook forwarding — [install guide](https://stripe.com/docs/stripe-cli) (`brew install stripe/stripe-cli/stripe` on macOS)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/fetchsandbox/showcases.git
cd showcases/acme-checkout

pnpm install                              # installs Next.js deps

# Python deps in a fresh venv
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Get a Resend API key (the only "real" key you need)

The whole point of this demo is that the receipt email actually arrives. For that you need a Resend key tied to your own email.

1. Sign up at https://resend.com (free — no credit card)
2. Use the same email you plan to sign in to Clerk with — the demo will send the receipt there
3. Go to **API Keys** → **Create API Key**
4. Choose **Sending access** → name it anything (e.g. `acme-checkout-local`)
5. Copy the `re_...` value — you'll paste it in step 4

⚠️ **About Resend's sandbox sender**

By default the demo uses `onboarding@resend.dev` as the sender. With this sender, Resend ONLY delivers emails to the email tied to your Resend account. **Sign in to Clerk with the same email** you used for Resend, or the receipt won't arrive.

### 3. Get Stripe and Clerk keys

Two options:

- **Fast path:** Raj has shared test-mode Stripe + Clerk keys in the chat — paste them into the `.env` files in step 4 and skip ahead. These are test-mode, so no real money or accounts are touched.
- **Your own keys:** Sign up at https://dashboard.stripe.com and https://dashboard.clerk.com (both free, no card needed for test mode), then grab the keys yourself.

### 4. Fill in the env files

```bash
cp server/.env.example server/.env
cp web/.env.local.example web/.env.local
```

Open both files and replace the placeholders. Each file has comments explaining what each variable is for and where to get it.

The values you'll need across both files:

| Where | Variable | Source |
|---|---|---|
| `web/.env.local` | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard or chat |
| `web/.env.local` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard or chat |
| `web/.env.local` | `CLERK_SECRET_KEY` | Clerk dashboard or chat |
| `server/.env` | `STRIPE_SECRET_KEY` | Stripe dashboard or chat |
| `server/.env` | `STRIPE_WEBHOOK_SECRET` | Filled after step 5 below |
| `server/.env` | `CLERK_JWT_ISSUER` | Clerk dashboard (Configure → JWT Templates) or chat |
| `server/.env` | `CLERK_WEBHOOK_SECRET` | Clerk webhook config or any string for local dev |
| `server/.env` | `RESEND_API_KEY` | Your Resend dashboard (step 2) |

### 5. Start the Stripe webhook listener

In a fresh terminal:

```bash
stripe login                                                   # one-time
stripe listen --forward-to localhost:8000/webhook
```

This prints a `whsec_...` value. Copy it into `server/.env` as `STRIPE_WEBHOOK_SECRET` and save. Leave this terminal running through the demo.

### 6. Run the app

In another terminal:

```bash
pnpm dev    # starts FastAPI on :8000 AND Next.js on :3000
```

Wait for both:

```
[server] Uvicorn running on http://127.0.0.1:8000
[web   ] - Local: http://localhost:3000
```

---

## Run the demo

1. Open http://localhost:3000
2. Click **Sign in** → use **the same email you used to sign up to Resend**
3. Go to `/checkout`
4. Pay with:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date (e.g. `12/30`)
   - CVC: any 3 digits (e.g. `123`)
   - ZIP: any 5 digits

Watch in order:

- The **Stripe listen** terminal — `payment_intent.succeeded → 200`
- The **server** terminal — `[receipt] sent to <your email> — id=...`
- **Your inbox** — the receipt email arrives

The Resend dashboard at https://resend.com/emails shows the same email with `delivered` status.

---

## Try the FetchSandbox MCP flow

The interesting part: the Resend integration in this repo was added by Claude using the FetchSandbox MCP, end-to-end, in front of a camera. If you want to repeat that exercise from scratch:

1. **Reset** the Resend wiring (you'll add it back via the MCP):

   ```bash
   # In server/main.py, comment out:
   #   - the RESEND_API_KEY / RESEND_FROM imports near the top
   #   - the send_receipt() call inside the payment_intent.succeeded branch
   #   - the send_receipt() helper at the bottom
   # In web/app/checkout/CheckoutForm.tsx, remove `useUser` and the
   # `email` field from the POST body.
   ```

2. **Install** FetchSandbox MCP (one-time, per IDE). The `.mcp.json` in this repo wires it for Claude Code / Cursor / VS Code Claude automatically — just open the repo in your IDE and accept the install prompt when it asks to run `npx fetchsandbox-mcp`.

3. **Ask Claude:**

   > This is a Next.js + FastAPI checkout app. Stripe + Clerk are wired but customers don't get a receipt email after they pay. I want to integrate Resend to send a receipt on payment_intent.succeeded.
   >
   > Use fetchsandbox to prove the Resend integration first — don't write any code until the sandbox call works end-to-end and shows me the simulated `email.sent` webhook.

4. Answer the 3 discovery questions Claude will ask (transactional · sandbox sender · your email).

5. Claude shows the sandbox proof (no real Resend call yet — it's running against `https://fetchsandbox.com/sandbox/resend`), then offers to write the code. Accept the diff.

6. Restart the server (`pnpm dev` auto-reloads), run the checkout again, watch the receipt arrive.

---

## File map

```
acme-checkout/
├── package.json              ← top-level scripts (`pnpm dev`)
├── pnpm-workspace.yaml       ← declares web/ as workspace
├── .mcp.json                 ← wires FetchSandbox MCP for any IDE
├── web/                      ← Next.js 15 + React 19 + Stripe Elements + Clerk
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          ← landing
│   │   └── checkout/
│   │       ├── page.tsx
│   │       ├── CheckoutForm.tsx
│   │       └── done/page.tsx
│   ├── middleware.ts         ← Clerk middleware
│   └── .env.local.example
└── server/                   ← FastAPI
    ├── main.py               ← Stripe + Clerk + Resend (with comments showing what the MCP added)
    ├── requirements.txt
    └── .env.example
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `/checkout` shows 404 or redirect loop | You're not signed in. Click "Sign in" first. |
| `payment_intent.succeeded` never appears in the Stripe-listen pane | The `stripe listen` terminal closed, or `STRIPE_WEBHOOK_SECRET` in `server/.env` doesn't match the `whsec_…` the CLI printed. Re-copy it and restart the server. |
| `[receipt] failed for ...: 403` in server logs | The recipient email is different from your Resend account email. With `onboarding@resend.dev`, Resend only ships to your own account email. Sign in to Clerk with the same email. |
| `pnpm dev` errors with "command not found: stripe" | The Stripe CLI isn't installed. See [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli). |
| FastAPI startup error about env vars | A required key in `server/.env` is missing. The example file lists everything. |
| The "Pay $49.99" button does nothing | Open browser DevTools → Network tab. A red `create-payment-intent` request means the API base (`NEXT_PUBLIC_API_BASE`) doesn't match where FastAPI is running. |
