import Link from "next/link";
import LeadForm from "@/components/LeadForm";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Top nav */}
      <nav className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-400 text-[11px] font-black text-black">
              L
            </span>
            Lumen Leads
          </Link>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a className="transition-colors hover:text-white" href="#how">
              How it works
            </a>
            <a className="transition-colors hover:text-white" href="#pricing">
              Pricing
            </a>
            <Link
              className="transition-colors hover:text-white"
              href="/admin"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero + form */}
      <section className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_1fr]">
        {/* Left — copy */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400">
            For B2B teams losing leads to slow response
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tighter text-white sm:text-6xl">
            Speed is the only
            <br />
            <span className="text-amber-400">moat</span> in B2B.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
            Lumen captures inbound leads and pages the right sales rep within
            seconds. The faster you call, the more you close.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-8">
            <Stat value="< 30s" label="To first call" />
            <Stat value="38%" label="Higher win rate" />
            <Stat value="$0" label="Lost-to-followup" />
          </div>
        </div>

        {/* Right — lead form */}
        <div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_60px_-30px_rgba(0,0,0,0.5)]">
            <div className="rounded-xl bg-black/40 p-2">
              <div className="mb-4 px-5 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Talk to sales
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
                  See it run in your stack
                </h2>
              </div>
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="border-t border-white/[0.06] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/55">
            We sit between your lead-capture form and your sales reps&rsquo;
            phones. Three steps.
          </p>

          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Lead lands",
                d: "Your form posts to our endpoint. We score the lead by company size and intent.",
              },
              {
                n: "02",
                t: "We page sales",
                d: "The assigned rep gets an SMS within seconds — with the lead&rsquo;s name, company, value tier, and a one-tap deep link.",
              },
              {
                n: "03",
                t: "You close faster",
                d: "Reps call back before the lead has finished evaluating your competitor. Win rate goes up.",
              },
            ].map((step) => (
              <li
                key={step.n}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <p className="text-xs font-mono text-amber-400">{step.n}</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {step.t}
                </p>
                <p
                  className="mt-2 text-sm leading-relaxed text-white/55"
                  dangerouslySetInnerHTML={{ __html: step.d }}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs text-white/40">
            Lumen Leads — a FetchSandbox demo app. The Twilio integration is
            intentionally empty — see the repo README for the prompt to wire
            it via the FetchSandbox MCP coach.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/40">
        {label}
      </p>
    </div>
  );
}
