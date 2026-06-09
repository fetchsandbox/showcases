import { NextResponse } from "next/server";
import { createLead, listLeads, markNotified } from "@/lib/leads";
import { notifySalesRep } from "@/lib/twilio";

export async function GET() {
  return NextResponse.json({ leads: listLeads() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { name, email, company, companySize, need } = body as Record<
    string,
    string
  >;

  if (!name || !email || !company || !companySize || !need) {
    return NextResponse.json(
      { error: "missing required fields" },
      { status: 422 },
    );
  }

  const lead = createLead({ name, email, company, companySize, need });

  // TODO (Claude wires this via the FetchSandbox MCP coach):
  // - call notifySalesRep(lead) and capture the message SID + status
  // - markNotified(lead.id, { sid, status })
  // - handle the failure branch gracefully (don't fail the lead creation)
  const notify = await notifySalesRep(lead);
  if (notify.ok) {
    markNotified(lead.id, { sid: notify.sid, status: notify.status });
  }

  return NextResponse.json({ lead, notify });
}
