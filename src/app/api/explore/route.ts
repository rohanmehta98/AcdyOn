import { exploreCareer } from "@/lib/explore";
import { AdvisorError } from "@/lib/groq";

// Stateless: the question is used for one AI call and then discarded.

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const query = clip(body.query, 500);
  if (query.length < 2) {
    return Response.json({ error: "Type a career or a question about one." }, { status: 400 });
  }

  try {
    const guide = await exploreCareer({
      query,
      location: clip(body.location, 80),
      background: clip(body.background, 500),
    });
    return Response.json({ guide });
  } catch (err) {
    const status = err instanceof AdvisorError ? err.status : 500;
    const message = err instanceof AdvisorError ? err.message : "Something went wrong. Please try again.";
    return Response.json({ error: message }, { status });
  }
}
