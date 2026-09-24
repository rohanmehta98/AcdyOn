"use client";

import { useState, type ReactNode } from "react";
import type { Level, Resource, RoadmapPhase } from "@/lib/types";

/* ---------------- small building blocks ---------------- */

export function levelTone(l: Level, highIsGood: boolean) {
  const good = "bg-emerald-50 text-emerald-700";
  const mid = "bg-amber-50 text-amber-800";
  const bad = "bg-rose-50 text-rose-700";
  if (l === "Medium") return mid;
  return (l === "High") === highIsGood ? good : bad;
}

export function Section({ id, title, sub, children }: { id?: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} className="card rise scroll-mt-16 p-5 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Btn({ children, onClick, primary }: { children: ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium ${primary ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
    >
      {children}
    </button>
  );
}

export function Kpi({ label, value, sub, tone, small }: { label: string; value: string; sub?: string; tone?: string; small?: boolean }) {
  return (
    <div className="border-t border-slate-100 p-4 sm:p-5 md:border-t-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold tracking-tight ${small ? "text-sm leading-snug" : "text-xl"} ${tone ? `inline-block rounded-lg px-2 ${tone}` : ""}`}>{value}</p>
      {sub && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-xl px-2 py-2.5 ${tone}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-75">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

export function Pill({ children, tone }: { children: ReactNode; tone: string }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{children}</span>;
}

export function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-4 rounded-sm ${className}`} />
      {label}
    </span>
  );
}

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-slate-700">{children}</p>
    </div>
  );
}

export function List({ items, icon, tone }: { items: string[]; icon: string; tone: string }) {
  return (
    <ul className="space-y-3">
      {items.map((s) => (
        <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
          <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${tone}`}>{icon}</span>
          {s}
        </li>
      ))}
    </ul>
  );
}

export function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <ul className="space-y-2">
      {items.map((s, i) => {
        const on = done.has(i);
        return (
          <li key={s}>
            <label className="flex cursor-pointer gap-3 rounded-xl p-2 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={on}
                onChange={() => {
                  const n = new Set(done);
                  if (on) n.delete(i);
                  else n.add(i);
                  setDone(n);
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
              />
              <span className={`text-[15px] ${on ? "text-slate-400 line-through" : "text-slate-700"}`}>{s}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function Ring({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-2xl font-semibold">{value}</span>
    </div>
  );
}

export function SalaryLadder({ salary, note }: { salary: { entry: string; mid: string; senior: string }; note?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-800">Salary ladder (per year)</p>
      <div className="mt-3 space-y-2.5">
        {(
          [
            ["Entry", salary.entry, 40],
            ["Mid", salary.mid, 70],
            ["Senior", salary.senior, 100],
          ] as const
        ).map(([k, v, w]) => (
          <div key={k} className="grid grid-cols-[3.5rem_1fr] items-center gap-3 text-sm">
            <span className="text-slate-500">{k}</span>
            <div className="relative h-7 rounded-lg bg-slate-50">
              <div className="bar-grow absolute inset-y-0 left-0 rounded-lg bg-emerald-100" style={{ width: `${w}%` }} />
              <span className="relative flex h-full items-center px-2.5 font-medium text-emerald-900">{v}</span>
            </div>
          </div>
        ))}
      </div>
      {note && <p className="mt-3 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

export function RoadmapGrid({ roadmap }: { roadmap: RoadmapPhase[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {roadmap.map((r, i) => (
        <li key={r.phase} className="relative rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">{i + 1}</span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{r.phase}</p>
              <p className="font-semibold leading-snug">{r.focus}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {r.actions.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {a}
              </li>
            ))}
          </ul>
          {r.milestone && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <span className="font-medium">Milestone: </span>
              {r.milestone}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function ResourceGrid({ resources }: { resources: Resource[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <div key={r.name} className="flex flex-col rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-wrap gap-1.5">
            <Pill tone="bg-slate-100 text-slate-700">{r.type}</Pill>
            <Pill tone={r.cost.toLowerCase().startsWith("free") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}>{r.cost}</Pill>
            {r.duration && <Pill tone="bg-slate-100 text-slate-700">{r.duration}</Pill>}
          </div>
          <p className="mt-3 font-semibold leading-snug">{r.name}</p>
          <p className="text-sm text-slate-500">{r.provider}</p>
          <p className="mt-2 text-sm text-slate-700">{r.why}</p>
        </div>
      ))}
    </div>
  );
}
