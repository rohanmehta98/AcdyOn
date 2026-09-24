"use client";

import { useEffect, useState } from "react";
import CareerForm, { EMPTY_PROFILE } from "./CareerForm";
import Dashboard from "./Dashboard";
import GuideView from "./GuideView";
import { EXAMPLE_QUESTIONS, type CareerGuide, type CareerReport, type ExploreInput, type Profile } from "@/lib/types";

type View = "intro" | "form" | "loading" | "report" | "guide";
type Mode = "profile" | "explore";

const LOADING_STEPS: Record<Mode, string[]> = {
  profile: [
    "Reading your profile…",
    "Mapping your transferable skills…",
    "Scanning career paths that fit…",
    "Checking salaries in the Indian market…",
    "Building your 12-month roadmap…",
    "Picking courses that fit your budget…",
  ],
  explore: [
    "Understanding your question…",
    "Researching the career…",
    "Checking demand and pay in India…",
    "Mapping the ways in…",
    "Building a step-by-step roadmap…",
    "Answering common questions…",
  ],
};

export default function Advisor() {
  const [view, setView] = useState<View>("intro");
  const [mode, setMode] = useState<Mode>("explore");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [report, setReport] = useState<CareerReport | null>(null);
  const [ask, setAsk] = useState<ExploreInput>({ query: "", location: "", background: "" });
  const [guide, setGuide] = useState<{ data: CareerGuide; query: string } | null>(null);
  const [error, setError] = useState("");

  const go = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };

  async function post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data as T;
  }

  async function submitProfile(p: Profile) {
    setProfile(p);
    setError("");
    setMode("profile");
    go("loading");
    try {
      const { report } = await post<{ report: CareerReport }>("/api/recommend", p);
      setReport(report);
      go("report");
    } catch (e) {
      setError((e as Error).message);
      go("form");
    }
  }

  async function explore(input: ExploreInput) {
    const query = input.query.trim();
    if (!query) return;
    const merged = { ...input, query };
    setAsk(merged);
    setError("");
    setMode("explore");
    go("loading");
    try {
      const { guide } = await post<{ guide: CareerGuide }>("/api/explore", merged);
      setGuide({ data: guide, query });
      go("guide");
    } catch (e) {
      setError((e as Error).message);
      go("intro");
    }
  }

  // Deep-dive links reuse whatever context the person already gave us.
  const exploreFrom = (query: string) =>
    explore({
      query,
      location: ask.location || profile.city,
      background:
        ask.background ||
        [
          profile.status,
          profile.education && `${profile.education}${profile.stream ? ` (${profile.stream})` : ""}`,
          profile.experience && profile.experience !== "None" ? `${profile.experience} work experience` : "",
          profile.skills.length ? `good at ${profile.skills.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join("; "),
    });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            onClick={() => {
              setError("");
              go("intro");
            }}
            className="flex items-center gap-2.5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight">AcdyOn</span>
          </button>
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 sm:inline">
            🔒 Private: nothing you enter is saved
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-10 pt-2 sm:px-6">
        {view === "intro" && (
          <Intro
            initial={ask}
            error={error}
            onAsk={explore}
            onStartQuiz={() => {
              setError("");
              go("form");
            }}
          />
        )}
        {view === "form" && (
          <div className="space-y-4">
            {error && (
              <div className="mx-auto max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error} Your answers are still here, so press Generate again.
              </div>
            )}
            <CareerForm initial={profile} onSubmit={submitProfile} />
          </div>
        )}
        {view === "loading" && <Loading steps={LOADING_STEPS[mode]} title={mode === "profile" ? "Building your career plan" : "Preparing your career guide"} />}
        {view === "report" && report && (
          <Dashboard
            report={report}
            name={profile.name}
            onEdit={() => go("form")}
            onExplore={exploreFrom}
            onRestart={() => {
              setProfile(EMPTY_PROFILE);
              setReport(null);
              go("intro");
            }}
          />
        )}
        {view === "guide" && guide && (
          <GuideView
            guide={guide.data}
            query={guide.query}
            onAsk={() => {
              setAsk((a) => ({ ...a, query: "" }));
              go("intro");
            }}
            onExplore={exploreFrom}
            onPersonalise={() => go("form")}
          />
        )}
      </main>
    </div>
  );
}

function Intro({
  initial,
  error,
  onAsk,
  onStartQuiz,
}: {
  initial: ExploreInput;
  error: string;
  onAsk: (i: ExploreInput) => void;
  onStartQuiz: () => void;
}) {
  const [input, setInput] = useState(initial);
  const [showContext, setShowContext] = useState(Boolean(initial.location || initial.background));
  const set = (k: keyof ExploreInput, v: string) => setInput((p) => ({ ...p, [k]: v }));

  return (
    <div className="rise mx-auto max-w-3xl py-6 sm:py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> AI career advisor for India · free · any career
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">
          Ask about <span className="text-brand-600">any career</span>. Get a real plan.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 text-balance">
          IAS, CA, pilot, doctor, data scientist, designer or YouTuber: ask anything and get a full career guide with Indian salaries, exams and colleges.
        </p>
      </div>

      <form
        className="card mt-8 p-3 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onAsk(input);
        }}
      >
        <textarea
          value={input.query}
          onChange={(e) => set("query", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onAsk(input);
            }
          }}
          rows={2}
          maxLength={500}
          autoFocus
          placeholder="e.g. How do I become a CA after 12th? Is B.Tech in AI worth it?"
          className="w-full resize-none rounded-xl px-3 py-2 text-lg outline-none placeholder:text-slate-400"
        />
        {showContext && (
          <div className="grid gap-2 px-1 pb-2 sm:grid-cols-[1fr_2fr]">
            <input className="field" value={input.location} onChange={(e) => set("location", e.target.value)} placeholder="Your city, e.g. Jaipur" />
            <input
              className="field"
              value={input.background}
              onChange={(e) => set("background", e.target.value)}
              placeholder="Your background, e.g. 12th PCM, 78%, good at maths"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-1 pt-3">
          <button type="button" onClick={() => setShowContext((s) => !s)} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800">
            {showContext ? "− Hide context" : "+ Add your city & background for a personal fit check"}
          </button>
          <button type="submit" disabled={!input.query.trim()} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-40">
            Get career guide →
          </button>
        </div>
      </form>

      {error && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onAsk({ ...input, query: q })}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="my-10 flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or not sure what you want? <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button onClick={onStartQuiz} className="card group grid w-full gap-4 p-5 text-left transition hover:-translate-y-0.5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-2xl">🧭</span>
        <span>
          <span className="block text-lg font-semibold">Find careers that fit you</span>
          <span className="mt-0.5 block text-sm text-slate-500">
            Answer 4 quick tap-to-choose steps and get your top 4 career matches, a skill-gap check and a 12-month roadmap.
          </span>
        </span>
        <span className="rounded-xl bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white group-hover:bg-brand-700">Start quiz · 2 min</span>
      </button>
    </div>
  );
}

function Loading({ steps, title }: { steps: string[]; title: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), 1800);
    return () => clearInterval(t);
  }, [steps]);
  return (
    <div className="card rise mx-auto max-w-md p-8 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      <p className="mt-6 text-lg font-semibold">{title}</p>
      <ul className="mt-5 space-y-2 text-left text-sm">
        {steps.map((s, n) => (
          <li key={s} className={`flex items-center gap-2 transition-opacity ${n > i ? "opacity-30" : ""}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${n < i ? "bg-emerald-500 text-white" : n === i ? "bg-brand-600 text-white" : "bg-slate-200"}`}>
              {n < i ? "✓" : ""}
            </span>
            <span className={n === i ? "font-medium text-slate-900" : "text-slate-500"}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
