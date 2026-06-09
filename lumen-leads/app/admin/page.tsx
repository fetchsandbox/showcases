import Link from "next/link";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default function AdminLeadsPage() {
  const leads = listLeads();

  return (
    <main className="min-h-screen">
      <nav className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-400 text-[11px] font-black text-black">
              L
            </span>
            Lumen Leads · Admin
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Recent leads
            </h1>
            <p className="mt-1 text-sm text-white/55">
              In-memory store — resets on server restart.
            </p>
          </div>
          <p className="text-xs font-mono text-white/40">
            {leads.length} total
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="mt-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-base text-white/60">No leads yet.</p>
            <p className="mt-2 text-sm text-white/40">
              <Link className="text-amber-400 hover:underline" href="/">
                Go submit the form
              </Link>{" "}
              and they&apos;ll show up here.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs font-medium uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-5 py-3">Lead</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Tier</th>
                  <th className="px-5 py-3">Assigned to</th>
                  <th className="px-5 py-3">SMS</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-white/40">{lead.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white/80">{lead.company}</p>
                      <p className="text-xs text-white/40">
                        {lead.companySize}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <TierBadge tier={lead.valueTier} />
                    </td>
                    <td className="px-5 py-4 text-white/70">
                      {lead.assignedTo}
                    </td>
                    <td className="px-5 py-4">
                      <SmsBadge status={lead.notificationStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        className="text-xs text-amber-400 hover:underline"
                        href={`/admin/leads/${lead.id}`}
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    high: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    mid: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    exploratory: "border-white/[0.08] bg-white/[0.04] text-white/60",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[tier] ?? styles.exploratory}`}
    >
      {tier}
    </span>
  );
}

function SmsBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-block rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 text-xs text-white/40">
        not wired
      </span>
    );
  }
  const styles: Record<string, string> = {
    pending: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    sent: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    delivered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    failed: "border-red-400/30 bg-red-400/10 text-red-300",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "border-white/[0.08] text-white/60"}`}
    >
      {status}
    </span>
  );
}
