"use client";

import { useState } from "react";
import type { CareerReport } from "@/lib/types";
import { Btn, Callout, Kpi, Legend, List, Pill, ResourceGrid, Ring, RoadmapGrid, SalaryLadder, Section, Stat, Checklist, levelTone } from "./ui";

const SECTIONS = [
  ["matches", "Career matches"],
  ["profile", "Strengths"],
  ["skills", "Skill gap"],
  ["roadmap", "Roadmap"],
  ["learning", "Learning"],
  ["projects", "Projects"],
  ["next", "Next steps"],
] as const;

export default function Dashboard({
  report,
  name,
  onEdit,
  onRestart,
  onExplore,
}: {
  report: CareerReport;
  name: string;
  onEdit: () => void;
  onRestart: () => void;
  onExplore: (q: string) => void;
}) {
  const [selected, setSelected] = useState(0);
  const top = report.careers[0];
  const career = report.careers[selected] ?? top;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Actions */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Your personalised career report · not stored anywhere</p>
        <div className="flex gap-2">
          <Btn onClick={onEdit}>✎ Edit answers</Btn>
          <Btn onClick={() => window.print()}>⤓ Save as PDF</Btn>
          <Btn onClick={onRestart} primary>
            Start over
          </Btn>
        </div>
      </div>

      {/* Hero */}
      <section className="card rise overflow-hidden">
        <div className="grid gap-6 bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 p-6 text-white sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-white/15 px-3 py-1">{report.archetype}</span>
              {report.careerStage && <span className="rounded-full bg-white/15 px-3 py-1">{report.careerStage}</span>}
            </div>
            <p className="mt-4 text-sm text-white/75">{name ? `${name}, here's your plan` : "Here's your plan"}</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">{report.headline}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/85">{report.overview}</p>
          </div>
          <div className="flex items-center gap-4 md:flex-col md:justify-center">
            <Ring value={report.readinessScore} />
            <p className="text-sm text-white/80 md:text-center">
              Readiness for
              <br />
              <span className="font-semibold text-white">{top.title}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-slate-100 md:grid-cols-4 md:divide-x">
          <Kpi label="Best match" value={`${top.matchScore}%`} sub={top.title} />
          <Kpi label="Market demand" value={top.demand} sub={top.growthOutlook} tone={levelTone(top.demand, true)} />
          <Kpi label="Time to transition" value={top.timeToTransition} sub={`Difficulty: ${top.difficulty}`} />
          <Kpi label="Mid-level salary" value={top.salary.mid} sub={`Entry ${top.salary.entry}`} />
        </div>
      </section>

      {/* Section nav */}
      <nav className="no-print sticky top-0 z-10 -mx-4 bg-canvas/85 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700">
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* Career matches */}
      <Section id="matches" title="Your top career matches" sub="Select a career to see the full breakdown.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {report.careers.map((c, i) => (
            <button
              key={c.title}
              onClick={() => setSelected(i)}
              className={`rounded-2xl border p-4 text-left transition ${
                i === selected ? "border-brand-600 bg-brand-50 ring-2 ring-brand-600/15" : "border-slate-200 bg-white hover:border-brand-500/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">#{i + 1}</span>
                <span className="font-mono text-sm font-semibold text-brand-700">{c.matchScore}%</span>
              </div>
              <p className="mt-1 font-semibold leading-snug">{c.title}</p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                <div className="bar-grow h-full rounded-full bg-brand-600" style={{ width: `${c.matchScore}%` }} />
              </div>
            </button>
          ))}
        </div>

        <div key={career.title} className="rise mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{career.title}</h3>
                <button
                  onClick={() => onExplore(`How do I become a ${career.title}? Full guide please.`)}
                  className="no-print rounded-lg px-2 py-1 text-sm font-medium text-brand-600 hover:bg-brand-50"
                >
                  Deep dive into this career →
                </button>
              </div>
              <p className="mt-1.5 leading-relaxed text-slate-700">{career.whyFit}</p>
            </div>
            <Callout title="A day in the role">{career.dayInLife}</Callout>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-800">Key skills</p>
              <div className="flex flex-wrap gap-2">
                {career.keySkills.map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <SalaryLadder salary={career.salary} />
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Demand" value={career.demand} tone={levelTone(career.demand, true)} />
              <Stat label="AI risk" value={career.aiRisk} tone={levelTone(career.aiRisk, false)} />
              <Stat label="Difficulty" value={career.difficulty} tone={levelTone(career.difficulty, false)} />
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-medium text-slate-800">Outlook: </span>
              {career.growthOutlook} <span className="text-slate-400">·</span> ~{career.timeToTransition} to transition.
            </p>
          </div>
        </div>
      </Section>

      {/* Strengths / watch-outs */}
      <div id="profile" className="grid scroll-mt-16 gap-6 md:grid-cols-2">
        <Section title="Your strengths" sub="What gives you an edge.">
          <List items={report.strengths} icon="✓" tone="text-emerald-600 bg-emerald-50" />
        </Section>
        <Section title="Watch-outs" sub="Honest risks, and how to handle them.">
          <List items={report.watchOuts} icon="!" tone="text-amber-700 bg-amber-50" />
        </Section>
      </div>

      {/* Skill gap */}
      <Section id="skills" title={`Skill gap for ${top.title}`} sub="Where you are today versus where you need to be.">
        <div className="mb-4 flex gap-4 text-xs text-slate-500">
          <Legend className="bg-brand-600" label="You today" />
          <Legend className="border-2 border-dashed border-slate-400" label="Required" />
        </div>
        <div className="space-y-5">
          {report.skillGaps.map((g) => (
            <div key={g.skill} className="grid gap-2 md:grid-cols-[14rem_1fr] md:gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{g.skill}</p>
                  <Pill tone={levelTone(g.priority, false)}>{g.priority}</Pill>
                </div>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {g.current} → {g.required}
                </p>
              </div>
              <div>
                <div className="relative h-3 rounded-full bg-slate-100">
                  <div className="bar-grow absolute inset-y-0 left-0 rounded-full bg-brand-600" style={{ width: `${g.current}%` }} />
                  <div className="absolute -top-1 -bottom-1 w-0.5 rounded bg-slate-500" style={{ left: `calc(${g.required}% - 1px)` }} title={`Required: ${g.required}`} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{g.howToLearn}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Roadmap */}
      <Section id="roadmap" title="Your 12-month roadmap" sub="A realistic plan built around your available time.">
        <RoadmapGrid roadmap={report.roadmap} />
      </Section>

      {/* Learning */}
      <Section id="learning" title="Recommended learning" sub="Picked to match your budget and schedule.">
        <ResourceGrid resources={report.resources} />
      </Section>

      {/* Projects + quick wins */}
      <div id="projects" className="grid scroll-mt-16 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Section title="Portfolio projects" sub="Proof beats promises — build these to stand out.">
          <div className="space-y-3">
            {report.projects.map((p, i) => (
              <div key={p.title} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
                <span className="font-mono text-2xl font-semibold text-brand-500/40">0{i + 1}</span>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{p.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.skills.map((s) => (
                      <Pill key={s} tone="bg-brand-50 text-brand-700">
                        {s}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Quick wins this week" sub="Small moves, real momentum.">
          <Checklist items={report.quickWins} />
        </Section>
      </div>

      {/* Alternatives + advice */}
      <div id="next" className="grid scroll-mt-16 gap-6 lg:grid-cols-2">
        <Section title="Also worth exploring" sub="Adjacent paths that fit your profile.">
          <div className="space-y-3">
            {report.alternatives.map((a) => (
              <button
                key={a.title}
                onClick={() => onExplore(`Tell me about a career as a ${a.title}`)}
                className="block w-full rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-brand-50"
              >
                <p className="flex items-center justify-between font-semibold">
                  {a.title} <span className="no-print text-sm text-brand-600">Explore →</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">{a.note}</p>
              </button>
            ))}
          </div>
        </Section>
        <section className="card flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-100/70">A final word</p>
          <p className="mt-3 text-lg leading-relaxed text-balance">{report.finalAdvice}</p>
          <button onClick={onRestart} className="no-print mt-6 self-start rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-brand-50">
            Try another profile
          </button>
        </section>
      </div>

      <p className="pb-4 text-center text-xs text-slate-400">
        AI-generated guidance. Salaries and demand are estimates, so check them against local job listings before making big decisions.
      </p>
    </div>
  );
}
