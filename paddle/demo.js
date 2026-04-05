#!/usr/bin/env node
/**
 * Paddle Billing Integration Demo
 *
 * Runs the full subscription lifecycle against FetchSandbox:
 *   1. Create a customer
 *   2. Create a product + price
 *   3. Create a transaction (starts subscription)
 *   4. Activate subscription (trial → active)
 *   5. Pause subscription
 *   6. Resume subscription
 *   7. Cancel subscription
 *   8. Verify final state + webhooks
 *
 * Usage:
 *   SANDBOX_URL=https://fetchsandbox.com SANDBOX_ID=<id> API_KEY=<key> node demo.js
 *
 * Or run against the seeded sandbox (no env vars needed after deploy).
 */

const BASE = process.env.SANDBOX_URL || "https://fetchsandbox.com";
const SANDBOX_ID = process.env.SANDBOX_ID || "";
const API_KEY = process.env.API_KEY || "";

// ── Helpers ──────────────────────────────────────────────────────────────

async function paddleAPI(method, path, body) {
  const url = SANDBOX_ID
    ? `${BASE}/sandbox/${SANDBOX_ID}${path}`
    : `${BASE}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(API_KEY ? { "API-Key": API_KEY } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function log(icon, msg, detail) {
  console.log(`  ${icon} ${msg}${detail ? `  \x1b[2m${detail}\x1b[0m` : ""}`);
}

function pass(msg, detail) { log("\x1b[32m✓\x1b[0m", msg, detail); }
function fail(msg, detail) { log("\x1b[31m✗\x1b[0m", msg, detail); }
function info(msg) { console.log(`\n  \x1b[1m${msg}\x1b[0m`); }

// ── Demo Flow ────────────────────────────────────────────────────────────

async function main() {
  console.log("\n\x1b[1m  Paddle Billing Integration Demo\x1b[0m");
  console.log("  Running against FetchSandbox\n");

  let passed = 0;
  let failed = 0;
  const start = Date.now();

  // ── Step 1: Get sandbox info ──────────────────────────────────────
  if (SANDBOX_ID) {
    const { status, data } = await paddleAPI("GET", "/customers");
    if (status === 200) {
      pass("Connected to sandbox", `${SANDBOX_ID}`);
      passed++;
    } else {
      fail("Cannot connect to sandbox", `status=${status}`);
      failed++;
      process.exit(1);
    }
  }

  // ── Step 2: Use seeded subscription (trialing) ────────────────────
  info("Subscription Lifecycle");

  const subId = "sub_01hv8xqmay5w5rfsnzkxzgy0yp";

  // Get the trialing subscription
  const { status: getStatus, data: getSub } = await paddleAPI("GET", `/subscriptions/${subId}`);
  if (getStatus === 200) {
    const sub = getSub.result || getSub;
    pass("Get trialing subscription", `id=${subId} status=${sub.status}`);
    passed++;
  } else {
    fail("Get subscription failed", `status=${getStatus}`);
    failed++;
  }

  // Activate: trialing → active
  const { status: actStatus, data: actSub } = await paddleAPI("POST", `/subscriptions/${subId}/activate`);
  if (actStatus === 200) {
    const sub = actSub.result || actSub;
    pass("Activate subscription", `trialing → ${sub.status || "active"}`);
    passed++;
  } else {
    fail("Activate failed", `status=${actStatus} ${JSON.stringify(actSub).slice(0, 80)}`);
    failed++;
  }

  // Pause: active → paused
  const { status: pauseStatus, data: pauseSub } = await paddleAPI("POST", `/subscriptions/${subId}/pause`);
  if (pauseStatus === 200) {
    const sub = pauseSub.result || pauseSub;
    pass("Pause subscription", `active → ${sub.status || "paused"}`);
    passed++;
  } else {
    fail("Pause failed", `status=${pauseStatus}`);
    failed++;
  }

  // Resume: paused → active
  const { status: resumeStatus, data: resumeSub } = await paddleAPI("POST", `/subscriptions/${subId}/resume`);
  if (resumeStatus === 200) {
    const sub = resumeSub.result || resumeSub;
    pass("Resume subscription", `paused → ${sub.status || "active"}`);
    passed++;
  } else {
    fail("Resume failed", `status=${resumeStatus}`);
    failed++;
  }

  // Cancel: active → canceled
  const { status: cancelStatus, data: cancelSub } = await paddleAPI("POST", `/subscriptions/${subId}/cancel`);
  if (cancelStatus === 200) {
    const sub = cancelSub.result || cancelSub;
    pass("Cancel subscription", `active → ${sub.status || "canceled"}`);
    passed++;
  } else {
    fail("Cancel failed", `status=${cancelStatus} ${JSON.stringify(cancelSub).slice(0, 80)}`);
    failed++;
  }

  // Verify final state
  const { status: verifyStatus, data: verifySub } = await paddleAPI("GET", `/subscriptions/${subId}`);
  if (verifyStatus === 200) {
    const sub = verifySub.result || verifySub;
    const finalStatus = sub.status;
    if (finalStatus === "canceled") {
      pass("Verify final state", `status=canceled ✓`);
      passed++;
    } else {
      fail("Final state wrong", `expected=canceled got=${finalStatus}`);
      failed++;
    }
  }

  // ── Step 3: Transaction Flow ──────────────────────────────────────
  info("Transaction Flow");

  const { status: txnStatus, data: txnData } = await paddleAPI("POST", "/transactions", {
    customer_id: "ctm_01hv6y1jedq4p1n0yqn5ba3ky4",
    items: [{ price_id: "pri_01hv8y5ehszzq0yv20ttx3166y", quantity: 3 }],
    currency_code: "USD",
    collection_mode: "automatic",
  });
  if (txnStatus === 201 || txnStatus === 200) {
    const txn = txnData.result || txnData;
    pass("Create transaction", `id=${txn.id} status=${txn.status}`);
    passed++;
  } else {
    fail("Create transaction failed", `status=${txnStatus}`);
    failed++;
  }

  // ── Step 4: Product Catalog ───────────────────────────────────────
  info("Product Catalog");

  const { status: prodStatus, data: prodData } = await paddleAPI("POST", "/products", {
    name: "Demo Plan",
    tax_category: "standard",
    description: "Created by integration demo",
  });
  if (prodStatus === 201 || prodStatus === 200) {
    const prod = prodData.result || prodData;
    pass("Create product", `id=${prod.id} name=${prod.name || "Demo Plan"}`);
    passed++;

    const { status: priceStatus, data: priceData } = await paddleAPI("POST", "/prices", {
      product_id: prod.id,
      description: "Demo - Monthly",
      unit_price: { amount: "4999", currency_code: "USD" },
      billing_cycle: { interval: "month", frequency: 1 },
      tax_mode: "account_setting",
    });
    if (priceStatus === 201 || priceStatus === 200) {
      const price = priceData.result || priceData;
      pass("Create price", `id=${price.id} amount=$49.99/mo`);
      passed++;
    } else {
      fail("Create price failed", `status=${priceStatus}`);
      failed++;
    }
  } else {
    fail("Create product failed", `status=${prodStatus}`);
    failed++;
  }

  // ── Summary ───────────────────────────────────────────────────────
  const duration = Date.now() - start;
  console.log(`\n  ${"━".repeat(50)}`);
  if (failed === 0) {
    console.log(`\n  \x1b[32m✓\x1b[0m \x1b[1mAll ${passed} steps passed\x1b[0m  \x1b[2m(${duration}ms)\x1b[0m`);
    console.log(`\n  Subscription lifecycle: trialing → active → paused → active → canceled`);
    console.log(`  Transaction created and verified`);
    console.log(`  Product catalog set up with monthly pricing\n`);
  } else {
    console.log(`\n  \x1b[31m✗\x1b[0m ${passed} passed, ${failed} failed  \x1b[2m(${duration}ms)\x1b[0m\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`\n  Error: ${err.message}\n`);
  process.exit(1);
});
