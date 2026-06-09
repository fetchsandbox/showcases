import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) notFound();

  return (
    <main className="min-h-screen">
      <nav className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link
            href="/admin"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            ← All leads
          </Link>
          <code className="font-mono text-xs text-white/40">{lead.id}</code>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
              {lead.valueTier} value · {lead.companySize} employees
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
              {lead.name}{" "}
              <span className="font-normal text-white/40">at</span>{" "}
              {lead.company}
            </h1>
            <p className="mt-2 text-sm text-white/55">{lead.email}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">
              Assigned to
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              {lead.assignedTo}
            </p>
            <p className="mt-0.5 font-mono text-xs text-white/40">
              {lead.assignedPhone}
            </p>
          </div>
        </div>

        <section className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">
            What they want
          </p>
          <p className="mt-2 text-base leading-relaxed text-white/85">
            {lead.need}
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">
            Notification
          </p>
          {lead.notificationSid ? (
            <div className="mt-3 space-y-1.5">
              <p className="text-sm text-white/85">
                <span className="text-white/40">Status:</span>{" "}
                <span className="font-semibold capitalize text-emerald-300">
                  {lead.notificationStatus}
                </span>
              </p>
              <p className="text-sm text-white/85">
                <span className="text-white/40">Sent:</span>{" "}
                {lead.notifiedAt}
              </p>
              <p className="font-mono text-xs text-white/40">
                SID: {lead.notificationSid}
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-md border border-amber-400/20 bg-amber-400/[0.05] p-4">
              <p className="text-sm text-amber-200">
                ⚠ No SMS sent — Twilio integration not wired yet.
              </p>
              <p className="mt-1.5 text-xs text-amber-200/70">
                See <code className="font-mono">README.md</code> for the
                Claude prompt that wires this via the FetchSandbox MCP coach.
              </p>
            </div>
          )}
        </section>

        <p className="mt-10 text-xs text-white/30">
          Created: {lead.createdAt}
        </p>
      </section>
    </main>
  );
}
