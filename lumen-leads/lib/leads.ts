/**
 * In-memory lead store. For a real app this would be Postgres + Drizzle.
 * For the demo, we just want enough to:
 *  1. Capture a lead from the form
 *  2. Render a lead detail page that the SMS notification can link to
 *  3. List all leads in the admin view
 */

export type ValueTier = "high" | "mid" | "exploratory";

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  companySize: string;
  need: string;
  valueTier: ValueTier;
  assignedTo: string; // sales rep name (mocked — would be FK in real app)
  assignedPhone: string; // sales rep phone (mocked)
  createdAt: string;
  notifiedAt: string | null; // set by the (yet-to-be-built) Twilio notifier
  notificationStatus:
    | "queued"
    | "sent"
    | "delivered"
    | "undelivered"
    | "failed"
    | null;
  notificationSid: string | null; // Twilio message SID once sent
};

// In-memory store. Resets on server restart — fine for a demo.
const leads = new Map<string, Lead>();

/** Naive value-tier inference based on company size. Sales likes obvious tags. */
function inferValueTier(companySize: string): ValueTier {
  if (companySize.includes("1000") || companySize.includes("500")) return "high";
  if (companySize.includes("200") || companySize.includes("50")) return "mid";
  return "exploratory";
}

/** Round-robin between two mocked reps. Real app would query DB. */
const mockReps = [
  { name: "Maria Chen", phone: "+15005550006" },
  { name: "Devon Park", phone: "+15005550007" },
];
let repCursor = 0;
function assignRep() {
  const rep = mockReps[repCursor % mockReps.length];
  repCursor++;
  return rep;
}

export function createLead(input: {
  name: string;
  email: string;
  company: string;
  companySize: string;
  need: string;
}): Lead {
  const id = `lead_${cryptoRandomId()}`;
  const rep = assignRep();
  const lead: Lead = {
    id,
    name: input.name,
    email: input.email,
    company: input.company,
    companySize: input.companySize,
    need: input.need,
    valueTier: inferValueTier(input.companySize),
    assignedTo: rep.name,
    assignedPhone: rep.phone,
    createdAt: new Date().toISOString(),
    notifiedAt: null,
    notificationStatus: null,
    notificationSid: null,
  };
  leads.set(id, lead);
  return lead;
}

export function getLead(id: string): Lead | null {
  return leads.get(id) ?? null;
}

export function listLeads(): Lead[] {
  return [...leads.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function markNotified(
  id: string,
  patch: { sid: string; status: Lead["notificationStatus"] },
): void {
  const lead = leads.get(id);
  if (!lead) return;
  lead.notifiedAt = new Date().toISOString();
  lead.notificationSid = patch.sid;
  lead.notificationStatus = patch.status;
}

function cryptoRandomId(): string {
  // Short, URL-safe, unguessable. Good enough for a demo.
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
