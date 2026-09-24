import { generateReport } from "@/lib/advisor";
import { AdvisorError } from "@/lib/groq";
import type { Profile } from "@/lib/types";

// Stateless: the profile is used for one AI call and then discarded.

const clip = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max = 15) =>
  Array.isArray(v) ? v.map((x) => clip(x, 60)).filter(Boolean).slice(0, max) : [];

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const profile: Profile = {
    name: clip(body.name, 60),
    status: clip(body.status, 40),
    city: clip(body.city, 80),
    education: clip(body.education, 40),
    stream: clip(body.stream, 40),
    experience: clip(body.experience, 20),
    skills: list(body.skills, 20),
    interests: list(body.interests),
    priorities: list(body.priorities, 3),
    budget: clip(body.budget, 40),
    timeline: clip(body.timeline, 40),
    goal: clip(body.goal, 600),
  };

  const missing = (["status", "education", "timeline"] as const).filter((k) => !profile[k]);
  if (missing.length || profile.interests.length === 0) {
    return Response.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  try {
    const report = await generateReport(profile);
    return Response.json({ report });
  } catch (err) {
    const status = err instanceof AdvisorError ? err.status : 500;
    const message = err instanceof AdvisorError ? err.message : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status });
  }
}
