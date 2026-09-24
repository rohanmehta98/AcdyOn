"use client";

import type { CareerGuide } from "@/lib/types";
import { Btn, Callout, Kpi, List, Pill, ResourceGrid, Ring, RoadmapGrid, SalaryLadder, Section, levelTone } from "./ui";

export default function GuideView({
  guide,
  query,
  onAsk,
  onExplore,
  onPersonalise,
}: {
  guide: CareerGuide;
  query: string;
  onAsk: () => void;
  onExplore: (q: string) => void;
  onPersonalise: () => void;
}) {
  const g = guide;
  const nav = [
    g.fitCheck && ["fit", "Your fit"],
    g.comparison && ["compare", "Comparison"],
    ["role", "The role"],
    ["paths", "Ways in"],
    ["roadmap", "Roadmap"],
    ["learning", "Learning"],
    ["tradeoffs", "Pros & cons"],
    ["related", "Related"],
    ["faq", "FAQ"],
  ].filter(Boolean) as [string, string][];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Career guide · not stored anywhere</p>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={onAsk}>← Ask another</Btn>
          <Btn onClick={() => window.print()}>⤓ Save as PDF</Btn>
          <Btn onClick={onPersonalise} primary>
            Get personalised matches
          </Btn>
        </div>
      </div>

      {/* Hero */}
      <section className="card rise overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-700 p-6 text-white sm:p-8">
          <p className="text-sm text-white/60">
            You asked: <span className="text-white/90">“{query}”</span>
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{g.careerTitle}</h1>
          {g.tagline && <p className="mt-1 text-white/70">{g.tagline}</p>}
          <div className="mt-6 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-100">Short answer</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/95 sm:text-base">{g.directAnswer}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Kpi label="Demand" value={g.stats.demand} tone={levelTone(g.stats.demand, true)} />
          <Kpi label="AI risk" value={g.stats.aiRisk} tone={levelTone(g.stats.aiRisk, false)} />
          <Kpi label="Hard to enter" value={g.stats.difficulty} tone={levelTone(g.stats.difficulty, false)} />
          <Kpi label="Work-life balance" value={g.stats.workLifeBalance} tone={levelTone(g.stats.workLifeBalance, true)} />
          <Kpi label="Time to enter" value={g.stats.timeToEnter} />
          <Kpi label="Typical education" value={g.stats.typicalEducation} small />
        </div>
      </section>

      <nav className="no-print sticky top-0 z-10 -mx-4 bg-canvas/85 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700">
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* Fit check */}
      {g.fitCheck && (
        <section id="fit" className="card rise scroll-mt-16 grid gap-6 p-5 sm:p-7 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex items-center gap-4 rounded-2xl bg-brand-600 p-5 text-white">
            <Ring value={g.fitCheck.score} />
            <p className="text-sm text-white/80">
              Fit with
              <br />
              <span className="font-semibold text-white">your background</span>
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">How well this fits you</h2>
            <p className="mt-1 text-slate-700">{g.fitCheck.verdict}</p>
            <div className="mt-4">
              <List items={g.fitCheck.reasons} icon="→" tone="bg-brand-50 text-brand-700" />
            </div>
          </div>
        </section>
      )}

      {/* Comparison */}
      {g.comparison && (
        <Section id="compare" title="Side-by-side comparison">
          <div className="-mx-5 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 font-medium text-slate-500 sm:pl-0">Aspect</th>
                  {g.comparison.options.map((o) => (
                    <th key={o} className="px-4 py-3 font-semibold">
                      {o}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.comparison.rows.map((r) => (
                  <tr key={r.aspect} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-700 sm:pl-0">{r.aspect}</td>
                    {r.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-slate-600">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* The role */}
      <div id="role" className="grid scroll-mt-16 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="What the job really is">
          <p className="leading-relaxed text-slate-700">{g.overview}</p>
          <div className="mt-4">
            <Callout title="A day in the role">{g.dayInLife}</Callout>
          </div>
          <p className="mb-3 mt-5 text-sm font-medium text-slate-800">Key responsibilities</p>
          <List items={g.responsibilities} icon="•" tone="bg-slate-100 text-slate-500" />
        </Section>
        <div className="space-y-6">
          <Section title="Pay & outlook">
            <SalaryLadder salary={g.salary} note={g.salaryNote} />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              <span className="font-medium text-slate-800">5-year outlook: </span>
              {g.growthOutlook}
            </p>
          </Section>
          <Section title="Skills you need">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Technical</p>
            <div className="flex flex-wrap gap-1.5">
              {g.technicalSkills.map((s) => (
                <Pill key={s} tone="bg-brand-50 text-brand-700">
                  {s}
                </Pill>
              ))}
            </div>
            <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Soft skills</p>
            <div className="flex flex-wrap gap-1.5">
              {g.softSkills.map((s) => (
                <Pill key={s} tone="bg-slate-100 text-slate-700">
                  {s}
                </Pill>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Entry paths */}
      <Section id="paths" title="Ways to get in" sub="Different routes, different trade-offs.">
        <div className="grid gap-3 md:grid-cols-3">
          {g.entryPaths.map((p, i) => (
            <div key={p.name} className="flex flex-col rounded-2xl border border-slate-200 p-5">
              <span className="font-mono text-xs text-brand-600">Route {i + 1}</span>
              <p className="mt-1 font-semibold">{p.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.duration && <Pill tone="bg-slate-100 text-slate-700">⏱ {p.duration}</Pill>}
                {p.cost && <Pill tone="bg-amber-50 text-amber-800">{p.cost}</Pill>}
              </div>
              <p className="mt-3 text-sm text-slate-700">{p.description}</p>
              {p.bestFor && (
                <p className="mt-auto pt-3 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">Best for: </span>
                  {p.bestFor}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section id="roadmap" title="Step-by-step roadmap">
        <RoadmapGrid roadmap={g.roadmap} />
      </Section>

      <Section id="learning" title="Where to learn">
        <ResourceGrid resources={g.resources} />
      </Section>

      {/* Trade-offs */}
      <div id="tradeoffs" className="grid scroll-mt-16 gap-6 md:grid-cols-2">
        <Section title="Pros">
          <List items={g.pros} icon="+" tone="bg-emerald-50 text-emerald-700" />
        </Section>
        <Section title="Cons">
          <List items={g.cons} icon="−" tone="bg-rose-50 text-rose-700" />
        </Section>
        <Section title="You'll thrive if…">
          <List items={g.goodFit} icon="✓" tone="bg-emerald-50 text-emerald-700" />
        </Section>
        <Section title="Think twice if…">
          <List items={g.notFit} icon="!" tone="bg-amber-50 text-amber-700" />
        </Section>
      </div>

      {/* Related */}
      <div id="related" className="grid scroll-mt-16 gap-6 lg:grid-cols-2">
        {g.specialisations.length > 0 && (
          <Section title="Specialisations" sub="Where you can take this career.">
            <div className="space-y-3">
              {g.specialisations.map((s) => (
                <div key={s.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.note}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
        <Section title="Related careers" sub="Tap one to explore it.">
          <div className="space-y-3">
            {g.relatedCareers.map((s) => (
              <button
                key={s.title}
                onClick={() => onExplore(`Tell me about a career as a ${s.title}`)}
                className="group block w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-brand-500 hover:bg-brand-50/50"
              >
                <p className="flex items-center justify-between font-semibold">
                  {s.title}
                  <span className="no-print text-brand-600 opacity-0 transition group-hover:opacity-100">Explore →</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">{s.note}</p>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* FAQ */}
      <Section id="faq" title="Frequently asked questions">
        <div className="divide-y divide-slate-100">
          {g.faqs.map((f, i) => (
            <details key={f.q} className="group py-3" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span className="text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <section className="card flex flex-col gap-5 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-100/70">A final word</p>
          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-balance">{g.finalAdvice}</p>
        </div>
        <button onClick={onPersonalise} className="no-print shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-brand-50">
          Is this right for me? →
        </button>
      </section>

      <p className="pb-4 text-center text-xs text-slate-400">
        AI-generated guidance. Check salaries, exams and requirements with official sources before making big decisions.
      </p>
    </div>
  );
}
