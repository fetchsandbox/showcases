import { NextResponse } from "next/server";
import { getLead } from "@/lib/leads";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) {
    return NextResponse.json({ error: "lead not found" }, { status: 404 });
  }
  return NextResponse.json({ lead });
}
