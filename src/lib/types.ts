// Shared types between the form, the API route and the dashboard.
// Nothing here is persisted — a profile lives only for one request.

export type Profile = {
  name: string;
  status: string;
  city: string;
  education: string;
  stream: string;
  experience: string;
  skills: string[];
  interests: string[];
  priorities: string[];
  budget: string;
  timeline: string;
  goal: string;
};

export type Level = "High" | "Medium" | "Low";

export type CareerMatch = {
  title: string;
  matchScore: number;
  whyFit: string;
  dayInLife: string;
  salary: { entry: string; mid: string; senior: string };
  demand: Level;
  aiRisk: Level;
  growthOutlook: string;
  timeToTransition: string;
  difficulty: Level;
  keySkills: string[];
};

export type SkillGap = {
  skill: string;
  current: number;
  required: number;
  priority: Level;
  howToLearn: string;
};

export type RoadmapPhase = {
  phase: string;
  focus: string;
  actions: string[];
  milestone: string;
};

export type Resource = {
  name: string;
  provider: string;
  type: string;
  cost: string;
  duration: string;
  why: string;
};

export type CareerReport = {
  headline: string;
  overview: string;
  archetype: string;
  careerStage: string;
  readinessScore: number;
  strengths: string[];
  watchOuts: string[];
  careers: CareerMatch[];
  skillGaps: SkillGap[];
  roadmap: RoadmapPhase[];
  resources: Resource[];
  projects: { title: string; description: string; skills: string[] }[];
  quickWins: string[];
  alternatives: { title: string; note: string }[];
  finalAdvice: string;
};

/* ---------- "Ask about any career" mode ---------- */

export type ExploreInput = {
  query: string;
  location: string;
  background: string;
};

export type CareerGuide = {
  intent: string;
  careerTitle: string;
  tagline: string;
  directAnswer: string;
  overview: string;
  stats: {
    demand: Level;
    aiRisk: Level;
    difficulty: Level;
    workLifeBalance: Level;
    timeToEnter: string;
    typicalEducation: string;
  };
  salary: { entry: string; mid: string; senior: string };
  salaryNote: string;
  growthOutlook: string;
  dayInLife: string;
  responsibilities: string[];
  technicalSkills: string[];
  softSkills: string[];
  entryPaths: { name: string; duration: string; cost: string; description: string; bestFor: string }[];
  roadmap: RoadmapPhase[];
  resources: Resource[];
  specialisations: { title: string; note: string }[];
  pros: string[];
  cons: string[];
  goodFit: string[];
  notFit: string[];
  comparison: { options: string[]; rows: { aspect: string; values: string[] }[] } | null;
  fitCheck: { score: number; verdict: string; reasons: string[] } | null;
  relatedCareers: { title: string; note: string }[];
  faqs: { q: string; a: string }[];
  finalAdvice: string;
};

export const EXAMPLE_QUESTIONS = [
  "How do I become an IAS officer?",
  "CA vs MBA: which is better after B.Com?",
  "How to become a commercial pilot in India?",
  "Is data science a good career in India in 2026?",
  "Career options after 12th PCB other than NEET",
  "Can I switch from BPO job to IT without a degree?",
];

export const OPTIONS = {
  status: [
    "School student (9th–12th)",
    "College student",
    "Fresh graduate",
    "Working professional",
    "Want to switch career",
    "Looking for a job",
    "Returning after a break",
  ],
  education: ["10th", "12th", "Diploma / ITI", "Graduate", "Post-graduate", "PhD"],
  stream: [
    "Science (PCM)",
    "Science (PCB)",
    "Commerce",
    "Arts / Humanities",
    "Engineering / Tech",
    "Medical / Health",
    "Management",
    "Other",
  ],
  experience: ["None", "Under 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years"],
  interests: [
    "Technology & IT",
    "Data & AI",
    "Government jobs",
    "Defence & Armed Forces",
    "Medicine & Healthcare",
    "Engineering",
    "Business & Startups",
    "Finance & Banking",
    "Law",
    "Teaching",
    "Design & Arts",
    "Media & Content",
    "Marketing & Sales",
    "Aviation",
    "Sports",
    "Science & Research",
  ],
  skills: [
    "Maths",
    "Communication",
    "English speaking",
    "Computers",
    "Coding",
    "Drawing / Design",
    "Writing",
    "Leadership",
    "Selling / Convincing",
    "Accounts",
    "Problem solving",
    "Teaching others",
  ],
  priorities: [
    "High salary",
    "Job security / Govt job",
    "Work-life balance",
    "Respect & status",
    "Work from home",
    "Fast growth",
    "Helping people",
    "Creative work",
  ],
  budget: ["Free only", "Up to ₹25,000", "₹25k – ₹2 lakh", "₹2 lakh+"],
  timeline: ["Within 6 months", "6–12 months", "1–2 years", "2+ years"],
} as const;
