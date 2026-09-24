import { arr, askGroqJSON, level, num, resources, roadmap, salary, str, strs, titled } from "./groq";
import { INDIA_CONTEXT } from "./india";
import type { CareerReport, Profile } from "./types";

/* ------------------------------------------------------------------ */
/* 1. Deterministic profile analysis — grounds the model in facts it   */
/*    would otherwise have to guess, and keeps advice realistic.       */
/* ------------------------------------------------------------------ */

const EXPERIENCE_YEARS: Record<string, number> = {
  None: 0,
  "Under 1 year": 0.5,
  "1–3 years": 2,
  "3–5 years": 4,
  "5–10 years": 7,
  "10+ years": 12,
};

// Realistic weekly study time by life situation, so we never have to ask.
function hoursPerWeek(status: string) {
  if (status.includes("student")) return 10;
  if (status === "Looking for a job" || status === "Returning after a break") return 20;
  if (status === "Fresh graduate") return 15;
  return 7; // working people
}

export function analyseProfile(p: Profile) {
  const y = EXPERIENCE_YEARS[p.experience] ?? 0;
  const stage =
    y === 0
      ? p.status.includes("student")
        ? "Explorer (still studying)"
        : "Entry-level (no work experience yet)"
      : y < 3
        ? "Early career"
        : y < 8
          ? "Mid career"
          : "Senior professional";

  const isSwitch = p.status === "Want to switch career" || p.status === "Returning after a break";

  // Learning capacity over the chosen timeline, in hours.
  const hours = hoursPerWeek(p.status);
  const months = { "Within 6 months": 6, "6–12 months": 12, "1–2 years": 24, "2+ years": 36 }[p.timeline] ?? 12;
  const learningHours = Math.round(hours * 4.3 * months);
  const capacity =
    learningHours < 150
      ? "very limited — favour careers that reuse existing skills; avoid paths needing long retraining"
      : learningHours < 500
        ? "moderate — one focused certification or skill track is realistic"
        : learningHours < 1200
          ? "solid — a meaningful career change is realistic"
          : "high — even a deep change into a new field or a competitive-exam route is realistic";

  return { stage, isSwitch, hours, learningHours, capacity };
}

/* ------------------------------------------------------------------ */
/* 2. Prompt                                                            */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are a senior career strategist with 20 years of experience advising Indian students and professionals. You give specific, honest, practical advice — never generic filler.

Rules:
- Recommend careers that genuinely fit THIS person's background, skills, interests, priorities and constraints. Prefer paths where their existing experience is an advantage.
- Be realistic about their available learning time and budget. Do not suggest a path that cannot be reached within their timeline unless you say so plainly.
- Name real, currently existing courses, certifications, exams and platforms. Respect the budget: if "Free only", every resource must be free.
- If they name careers they are already considering, the 4 careers MUST include the most relevant one with an honest score (even if low) and a whyFit that says plainly whether it is a good idea. Their other options can go in alternatives.
- Their interests may be anything, including niche fields. Take them seriously.
- matchScore reflects fit honestly: best match 75–95, weaker ones lower. Do not give every career the same score.
- skillGaps "current" is your estimate of their level today (0–100) from what they told you; "required" is the level needed for the top career.
- Write in second person ("you"), warm but direct.

${INDIA_CONTEXT}

- Output ONLY a JSON object matching the schema. No markdown.`;

const SCHEMA = `{
  "headline": "one punchy sentence naming their best-fit direction",
  "overview": "3-4 sentences: who they are professionally and why the recommended direction fits",
  "archetype": "2-4 word professional archetype, e.g. 'Analytical Problem-Solver'",
  "careerStage": "short label",
  "readinessScore": 0-100 integer, how ready they are today to land the top career,
  "strengths": ["4-5 specific strengths drawn from their profile"],
  "watchOuts": ["2-4 honest risks or blind spots and how to handle each"],
  "careers": [ exactly 4 items, best first, each:
    { "title": "", "matchScore": 0-100, "whyFit": "2-3 sentences tied to their profile",
      "dayInLife": "1-2 sentences", "salary": {"entry": "", "mid": "", "senior": ""},
      "demand": "High|Medium|Low", "aiRisk": "High|Medium|Low", "growthOutlook": "1 sentence on 5-year outlook",
      "timeToTransition": "e.g. '4–6 months'", "difficulty": "High|Medium|Low", "keySkills": ["5-6 skills"] } ],
  "skillGaps": [ 5-6 items for the top career: { "skill": "", "current": 0-100, "required": 0-100, "priority": "High|Medium|Low", "howToLearn": "one concrete sentence" } ],
  "roadmap": [ exactly 4 phases: "First 30 days", "Months 2–3", "Months 4–6", "Months 7–12" — each
    { "phase": "", "focus": "short title", "actions": ["3-4 concrete actions"], "milestone": "measurable outcome" } ],
  "resources": [ 5-6 items: { "name": "", "provider": "", "type": "Course|Certification|Book|Community|Tool", "cost": "Free|Paid|Freemium", "duration": "", "why": "1 sentence" } ],
  "projects": [ 3 portfolio projects: { "title": "", "description": "1-2 sentences", "skills": ["2-4"] } ],
  "quickWins": ["4-5 things they can do this week"],
  "alternatives": [ 2-3 adjacent or unconventional paths: { "title": "", "note": "1 sentence" } ],
  "finalAdvice": "2-3 sentences of personal, motivating closing advice"
}`;

function buildUserPrompt(p: Profile) {
  const a = analyseProfile(p);
  const list = (xs: string[]) => (xs.length ? xs.join(", ") : "not specified");
  return `PROFILE
- Name: ${p.name || "not given"}
- Current status: ${p.status}
- City: ${p.city || "India (city not given)"}
- Highest education: ${p.education}${p.stream ? `, stream: ${p.stream}` : ""}
- Work experience: ${p.experience || "None"}
- Good at: ${list(p.skills)}
- Interests: ${list(p.interests)}
- Top priorities (most important first): ${list(p.priorities)}
- In their own words (goals / careers already in mind): ${p.goal || "nothing specific — help them discover it"}
- Budget for courses and training: ${p.budget || "not given, so prefer free or low-cost options"}
- Target timeline: ${p.timeline}

PRE-ANALYSIS (computed, treat as fact)
- Career stage: ${a.stage}
- ${a.isSwitch ? "This is a career change — highlight transferable skills." : "This is a first career or growth near their current direction."}
- Realistic study time: ~${a.hours} hours/week → ~${a.learningHours} hours over their timeline → ${a.capacity}

Return JSON exactly in this shape:
${SCHEMA}`;
}

/* ------------------------------------------------------------------ */
/* 3. Call Groq + normalise output                                      */
/* ------------------------------------------------------------------ */

export function generateReport(profile: Profile): Promise<CareerReport> {
  return askGroqJSON(SYSTEM_PROMPT, buildUserPrompt(profile), normalise);
}

function normalise(r: Record<string, unknown>): CareerReport {
  const careers = arr(r.careers)
    .map((c) => ({
        title: str(c.title),
        matchScore: num(c.matchScore),
        whyFit: str(c.whyFit),
        dayInLife: str(c.dayInLife),
        salary: salary(c.salary),
        demand: level(c.demand),
        aiRisk: level(c.aiRisk),
        growthOutlook: str(c.growthOutlook),
        timeToTransition: str(c.timeToTransition, "—"),
        difficulty: level(c.difficulty),
        keySkills: strs(c.keySkills),
    }))
    .filter((c) => c.title)
    .sort((a, b) => b.matchScore - a.matchScore);

  if (careers.length === 0) throw new Error("Model returned no careers");

  return {
    headline: str(r.headline, `Your strongest direction: ${careers[0].title}`),
    overview: str(r.overview),
    archetype: str(r.archetype, "Versatile Professional"),
    careerStage: str(r.careerStage),
    readinessScore: num(r.readinessScore),
    strengths: strs(r.strengths),
    watchOuts: strs(r.watchOuts),
    careers,
    skillGaps: arr(r.skillGaps)
      .map((g) => ({
        skill: str(g.skill),
        current: num(g.current),
        required: num(g.required),
        priority: level(g.priority),
        howToLearn: str(g.howToLearn),
      }))
      .filter((g) => g.skill),
    roadmap: roadmap(r.roadmap),
    resources: resources(r.resources),
    projects: arr(r.projects)
      .map((x) => ({ title: str(x.title), description: str(x.description), skills: strs(x.skills) }))
      .filter((x) => x.title),
    quickWins: strs(r.quickWins),
    alternatives: titled(r.alternatives),
    finalAdvice: str(r.finalAdvice),
  };
}
