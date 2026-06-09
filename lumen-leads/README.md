# Lumen Leads — page sales the moment a lead lands

A brownfield B2B lead-capture app you can run locally. **The Twilio integration is intentionally empty.** Your job is to wire it via Claude + the FetchSandbox MCP integration coach — and watch a real SMS arrive on your phone within ~10 minutes.

This is the demo we use to evaluate the FetchSandbox MCP flow against a real, second-domain integration (vs the `acme-checkout` Stripe+Clerk+Resend demo).

---

## The story

You're building **Lumen Leads**. Marketing is driving traffic. Leads ARE coming in — sitting in the in-memory store, neatly tagged with company size and value tier.

**The problem:** by the time sales checks the dashboard the next morning, 30% of yesterday's leads have already booked with a competitor. Speed-to-call is the entire game in this space, and your sales team isn't getting paged.

You need Twilio. You've never wired it up. You've heard the integration is "easy" but you also know the SMS lifecycle has teeth — silent failures, undelivered statuses that arrive 4 hours late, duplicate status callbacks. You don't want to build it twice.

**Your ask to Claude:**

> "Integrate Twilio so sales gets an SMS the moment a lead lands. Use FetchSandbox to prove it before touching my code."

---

## What you should see at the end

1. Open `http://localhost:3000`, fill out the lead form
2. **Your phone buzzes within ~3 seconds.** SMS arrives with the lead's name, company, value tier, and a deep link to `/admin/leads/<id>`
3. Refresh `/admin` — the lead row now shows `delivered` instead of `not wired`

10 minutes. Zero Twilio docs read. Zero hand-rolled status-callback reconciliation. No carrier waitlist.

---

## Prerequisites

- **Node.js** 20+ and **pnpm** (`npm install -g pnpm`)
- A free **Twilio** account — sign up at https://www.twilio.com/try-twilio (no credit card needed for test mode)
- A **real phone number** you can receive SMS at (only required AFTER you swap from Twilio test credentials to live credentials — see step 4 below)
- An IDE with **FetchSandbox MCP** support — Cursor, Claude Code, Cline, Windsurf, VS Code Claude (the `.mcp.json` in this repo wires it automatically)

---

## Setup

### 1. Clone + install

```bash
git clone https://github.com/fetchsandbox/showcases.git
cd showcases/lumen-leads
pnpm install
```

### 2. Get Twilio test credentials

The fastest path. Test credentials let you exercise the full Twilio API without spending a cent and without provisioning a phone number.

1. Sign in to https://console.twilio.com
2. Navigate to **Account → API keys & tokens → Test Credentials**
3. Copy `Test SID` (starts with `AC...`) and `Test Auth Token`

You'll use these for the **first run** to prove the integration works end-to-end. Magic test numbers:
- `+15005550006` — always sends successfully
- `+15005550001` — always returns "invalid number"
- `+15005550009` — always returns "undeliverable"

### 3. Fill in `.env.local`

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste:

```
TWILIO_ACCOUNT_SID=AC... (your test SID)
TWILIO_AUTH_TOKEN=... (your test auth token)
TWILIO_FROM_NUMBER=+15005550006
```

### 4. Run the app

```bash
pnpm dev
```

Open http://localhost:3000.

**You can fill out the lead form right now and it will save the lead — but no SMS will fire yet.** That's expected. The form will tell you "Twilio integration not wired" — that's the gap you're about to close with Claude.

---

## Wire Twilio with Claude + FetchSandbox MCP

Open the repo in your IDE. The `.mcp.json` will trigger an npx install permission prompt for `fetchsandbox-mcp` on first launch — accept it.

### Paste this prompt into Claude/Cursor:

```
This is a Next.js B2B lead-capture app. It captures leads to an
in-memory store and assigns them to sales reps, but it doesn't notify
sales when a lead lands.

I want to integrate Twilio so the assigned rep gets an SMS the moment a
lead is created. The SMS should include the lead's name, company, value
tier, and a deep link to /admin/leads/<id>.

Use FetchSandbox to prove the Twilio send + status-callback workflow
first — don't write any code until the sandbox call returns and shows
me the SMS lifecycle (queued → sent → delivered) and the compliance
notes about callback handling.

Then propose the diffs to lib/twilio.ts and app/api/leads/route.ts.
```

### What you should see Claude do

1. **Reads the repo** — identifies `lib/twilio.ts` as the stub, sees the TODO in `app/api/leads/route.ts`, finds the `Lead` schema.
2. **FetchSandbox MCP coach kicks in.** You'll see a tool call to `fetchsandbox.guide` or `fetchsandbox.coach`.
3. **Asks 3 discovery questions:**
   - Message type → **Transactional alert**
   - Sender number → **Sandbox test number** (`+15005550006`)
   - Failure handling → **Retry on undelivered, drop on hard-failed**
4. **Sandbox proof** — calls the FetchSandbox Twilio sandbox, shows:
   - `POST /Messages → 201` with a real `SM...` SID
   - Webhook lifecycle: `queued → sent → delivered`
   - Compliance notes (callback ordering, hard-bounce suppression)
5. **Proposes a diff** for `lib/twilio.ts` and `app/api/leads/route.ts`. You review and accept.
6. Server hot-reloads. Submit the form again. **Watch your phone.**

### Swapping in real credentials

The test credentials prove the integration works but won't actually deliver to a real phone. To see the SMS arrive on YOUR phone:

1. In the Twilio console, switch from **Test Credentials** to **Live Credentials**
2. Provision a Twilio number (free trial gives you one)
3. Update `.env.local`:
   - Swap `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` to live values
   - Set `TWILIO_FROM_NUMBER` to your provisioned Twilio number
4. Update the `assignedPhone` field in `lib/leads.ts` to your real phone number (replace the mocked `+15005550006`)
5. Restart `pnpm dev` and submit a lead — your phone should buzz within seconds

---

## File map

```
lumen-leads/
├── app/
│   ├── page.tsx                    ← landing + lead form
│   ├── admin/
│   │   ├── page.tsx                ← leads list
│   │   └── leads/[id]/page.tsx     ← single lead detail
│   ├── api/leads/
│   │   ├── route.ts                ← POST creates lead + (stub) notifies
│   │   └── [id]/route.ts           ← GET single lead
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── LeadForm.tsx                ← the form (client component)
├── lib/
│   ├── leads.ts                    ← typed Lead, in-memory store
│   └── twilio.ts                   ← EMPTY STUB — Claude wires this
├── .mcp.json                       ← FetchSandbox MCP config
├── .env.local.example
└── README.md
```

---

## What to flag back

High-signal feedback after the candidate session:

1. **Did Claude run the FetchSandbox MCP coach?** (Visible tool call.)
2. **Were the 3 discovery questions earned**, or generic?
3. **Did the sandbox proof show real webhook payloads** for `queued / sent / delivered`?
4. **Did the proposed diff edit the existing files** (`lib/twilio.ts`, `app/api/leads/route.ts`), or did Claude generate fresh ones?
5. **Did the compliance notes mention the real Twilio gotchas** — status callback ordering, hard-bounce suppression, idempotency on duplicate callbacks?
6. **Did the SMS actually arrive?** (The only true success signal.)

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Form submits but admin shows `not wired` | Expected before you run the Claude prompt. Run the prompt. |
| `[twilio] failed: 401 unauthorized` after wiring | `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` don't match what Twilio expects. Check for typos or extra whitespace. |
| `[twilio] failed: 21211 invalid 'To'` | The `assignedPhone` in `lib/leads.ts` isn't a valid E.164 number. For test mode, must be one of the magic numbers (`+15005550006`). For live mode, must be a real E.164 number. |
| Status stays at `sent` and never moves to `delivered` | Status callbacks need a publicly reachable URL. Set `TWILIO_STATUS_CALLBACK_URL` to an ngrok/cloudflared tunnel pointing at your localhost. |
| No SMS on real phone after switching to live creds | Twilio trial accounts can only send to *verified* phone numbers. Verify your number in the Twilio console first. |

---

## Related

- Sister demo: [acme-checkout](../acme-checkout) — Stripe + Clerk + Resend
- Underlying behavior: [Twilio status callbacks need reconciliation](https://fetchsandbox.com/blog/twilio-status-callback-reconciliation) — the same lifecycle bug pattern the coach surfaces in its compliance notes
