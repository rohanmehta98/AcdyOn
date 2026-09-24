"use client";

import { useState, type ReactNode } from "react";
import { OPTIONS, type Profile } from "@/lib/types";

export const EMPTY_PROFILE: Profile = {
  name: "",
  status: "",
  city: "",
  education: "",
  stream: "",
  experience: "None",
  skills: [],
  interests: [],
  priorities: [],
  budget: "",
  timeline: "",
  goal: "",
};

const STEPS = [
  { icon: "👋", title: "Tell us about yourself", short: "You" },
  { icon: "🎓", title: "Your studies & experience", short: "Studies" },
  { icon: "💡", title: "What do you enjoy?", short: "Interests" },
  { icon: "🎯", title: "What do you want?", short: "Goals" },
];

export default function CareerForm({ initial, onSubmit }: { initial: Profile; onSubmit: (p: Profile) => void }) {
  const [p, setP] = useState<Profile>(initial);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setError("");
    setP((prev) => ({ ...prev, [k]: v }));
  };
  const toggle = (k: "interests" | "skills" | "priorities", v: string, max: number) => {
    setError("");
    setP((prev) => {
      const cur = prev[k];
      if (cur.some((x) => x.toLowerCase() === v.toLowerCase())) return { ...prev, [k]: cur.filter((x) => x.toLowerCase() !== v.toLowerCase()) };
      return cur.length >= max ? prev : { ...prev, [k]: [...cur, v] };
    });
  };

  const validate = () => {
    if (step === 0 && !p.status) return "Please choose what describes you best.";
    if (step === 1 && !p.education) return "Please choose your highest education.";
    if (step === 2 && p.interests.length === 0) return "Pick at least one thing you enjoy.";
    if (step === 3 && !p.timeline) return "Please choose when you want to start your career move.";
    return "";
  };

  const next = () => {
    const e = validate();
    setError(e);
    if (e) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else onSubmit(p);
  };

  const isStudent = p.status.includes("student");

  return (
    <div className="card rise mx-auto w-full max-w-2xl p-5 sm:p-8">
      {/* Progress */}
      <div className="mb-7 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`text-left ${i < step ? "cursor-pointer" : "cursor-default"}`}
            aria-label={`Step ${i + 1}: ${s.title}`}
          >
            <span className={`block h-1.5 rounded-full transition-colors ${i <= step ? "bg-brand-600" : "bg-slate-200"}`} />
            <span className={`mt-1.5 block text-xs ${i === step ? "font-semibold text-brand-700" : "text-slate-400"}`}>{s.short}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl">{STEPS[step].icon}</span>
        <div>
          <p className="text-xs font-medium text-slate-400">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{STEPS[step].title}</h2>
        </div>
      </div>

      <form
        key={step}
        className="rise mt-7 space-y-7"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 0 && (
          <>
            <Q label="What describes you best?">
              <Chips options={OPTIONS.status} selected={[p.status]} onPick={(v) => set("status", v)} />
            </Q>
            <div className="grid gap-4 sm:grid-cols-2">
              <Q label="Your first name" optional>
                <input className="field" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Priya" />
              </Q>
              <Q label="Your city" optional>
                <input className="field" value={p.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Indore" />
              </Q>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Q label={isStudent ? "What are you studying now?" : "Highest education"}>
              <Chips options={OPTIONS.education} selected={[p.education]} onPick={(v) => set("education", v)} />
            </Q>
            <Q label="Your stream" optional>
              <Chips options={OPTIONS.stream} selected={[p.stream]} onPick={(v) => set("stream", p.stream === v ? "" : v)} />
            </Q>
            {!isStudent && (
              <Q label="Work experience">
                <Chips options={OPTIONS.experience} selected={[p.experience]} onPick={(v) => set("experience", v)} />
              </Q>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Q label="Pick what interests you" hint="Choose up to 5. Don't see yours? Add it below.">
              <Chips options={merge(OPTIONS.interests, p.interests)} selected={p.interests} onPick={(v) => toggle("interests", v, 5)} />
              <AddOwn placeholder="Cooking, Fashion, Farming" onAdd={(v) => toggle("interests", v, 5)} />
            </Q>
            <Q label="What are you good at?" optional hint="Tap all that apply.">
              <Chips options={merge(OPTIONS.skills, p.skills)} selected={p.skills} onPick={(v) => toggle("skills", v, 12)} />
              <AddOwn placeholder="Excel, Photography, Tally" onAdd={(v) => toggle("skills", v, 12)} />
            </Q>
          </>
        )}

        {step === 3 && (
          <>
            <Q label="When do you want to start your career move?">
              <Chips options={OPTIONS.timeline} selected={[p.timeline]} onPick={(v) => set("timeline", v)} />
            </Q>
            <Q label="What matters most to you?" optional hint="Pick up to 3, most important first.">
              <div className="flex flex-wrap gap-2">
                {OPTIONS.priorities.map((v) => {
                  const rank = p.priorities.indexOf(v);
                  return (
                    <button key={v} type="button" onClick={() => toggle("priorities", v, 3)} className={chipClass(rank >= 0)}>
                      {rank >= 0 && <span className="mr-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/25 text-xs">{rank + 1}</span>}
                      {v}
                    </button>
                  );
                })}
              </div>
            </Q>
            <Q label="How much can you spend on courses or training?" optional>
              <Chips options={OPTIONS.budget} selected={[p.budget]} onPick={(v) => set("budget", p.budget === v ? "" : v)} />
            </Q>
            <Q label="Anything already in mind?" optional hint="A dream job, a career your family suggests, or a doubt. We'll tell you honestly if it fits.">
              <textarea
                className="field min-h-20 resize-y"
                value={p.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="e.g. My parents want me to do engineering but I like design"
              />
            </Q>
          </>
        )}

        {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep(step - 1);
            }}
            className={`rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 ${step === 0 ? "invisible" : ""}`}
          >
            ← Back
          </button>
          <button type="submit" className="rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
            {step === STEPS.length - 1 ? "Show my career plan ✨" : "Next →"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Keeps options the person added themselves visible as selectable chips.
const merge = (base: readonly string[], picked: string[]) => [...base, ...picked.filter((x) => !base.includes(x))];

function Q({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[15px] font-medium text-slate-800">
        {label}
        {optional && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">optional</span>}
      </p>
      {hint && <p className="-mt-1.5 mb-2.5 text-sm text-slate-500">{hint}</p>}
      {children}
    </div>
  );
}

function AddOwn({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState("");
  const add = () => {
    if (v.trim()) onAdd(v.trim());
    setV("");
  };
  return (
    <div className="mt-3 flex gap-2">
      <input
        className="field"
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={`Add your own: ${placeholder}`}
      />
      <button type="button" onClick={add} className="shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50">
        + Add
      </button>
    </div>
  );
}

const chipClass = (on: boolean) =>
  `inline-flex items-center rounded-xl border px-4 py-2.5 text-sm transition-colors ${
    on ? "border-brand-600 bg-brand-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-brand-500 hover:bg-brand-50/50"
  }`;

function Chips({ options, selected, onPick }: { options: readonly string[]; selected: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onPick(o)} className={chipClass(selected.includes(o))} aria-pressed={selected.includes(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}
