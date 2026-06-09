"use client";

import { useState } from "react";

const COMPANY_SIZES = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1000",
  "1000+",
];

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; leadId: string; valueTier: string; notified: boolean }
  | { kind: "error"; message: string };

export default function LeadForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "submitting" });
    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      companySize: String(form.get("companySize") ?? ""),
      need: String(form.get("need") ?? ""),
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setStatus({
        kind: "success",
        leadId: json.lead.id,
        valueTier: json.lead.valueTier,
        notified: json.notify?.ok ?? false,
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wider">
            Submitted
          </span>
        </div>
        <p className="mt-3 text-lg text-white/90">
          Got it — {sentenceCase(status.valueTier)}-value lead routed to sales.
        </p>
        <p className="mt-1 text-sm text-white/60">
          Lead ID:{" "}
          <code className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-xs">
            {status.leadId}
          </code>
        </p>
        {status.notified ? (
          <p className="mt-3 text-sm text-emerald-300/90">
            ✓ Sales has been notified via SMS.
          </p>
        ) : (
          <p className="mt-3 text-sm text-amber-300/90">
            ⚠ Lead saved, but sales hasn&apos;t been paged yet — Twilio
            integration not wired. See the README.
          </p>
        )}
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-5 text-sm text-white/60 hover:text-white"
        >
          ← Submit another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Your name" name="name" placeholder="Alex Rivera" required />
        <Field
          label="Work email"
          name="email"
          type="email"
          placeholder="alex@acme.co"
          required
        />
      </div>

      <Field
        label="Company"
        name="company"
        placeholder="Acme Corp"
        required
      />

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
          Company size
        </label>
        <select
          name="companySize"
          required
          defaultValue=""
          className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        >
          <option value="" disabled>
            Pick one…
          </option>
          {COMPANY_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} employees
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
          What are you looking at us for?
        </label>
        <textarea
          name="need"
          required
          rows={3}
          placeholder="A line about what you're trying to do…"
          className="w-full resize-none rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      <button
        type="submit"
        disabled={status.kind === "submitting"}
        className="w-full rounded-md bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status.kind === "submitting" ? "Submitting…" : "Talk to sales →"}
      </button>

      {status.kind === "error" && (
        <p className="text-sm text-red-400">{status.message}</p>
      )}

      <p className="pt-1 text-center text-[11px] text-white/40">
        We reply within minutes. Often faster.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
      />
    </div>
  );
}

function sentenceCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
