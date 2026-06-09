/**
 * Twilio client stub.
 *
 * Claude will fill this in via the FetchSandbox MCP integration coach.
 * The coach should:
 *   1. Discover Twilio's send + status callback workflow
 *   2. Surface the lifecycle: queued → sent → delivered (or failed/undelivered)
 *   3. Show compliance notes (callback ordering, retry-on-undelivered,
 *      hard-bounce suppression)
 *   4. Propose a diff that wires this client + the /api/leads route
 *
 * DO NOT pre-implement. Leave this empty so the coach has something to
 * demonstrate end-to-end.
 */

import type { Lead } from "./leads";

export type NotifyResult =
  | { ok: true; sid: string; status: "queued" | "sent" | "delivered" }
  | { ok: false; error: string };

export async function notifySalesRep(_lead: Lead): Promise<NotifyResult> {
  return {
    ok: false,
    error: "Twilio client not wired yet — see README for the Claude prompt.",
  };
}
