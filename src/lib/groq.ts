import type { Level } from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Tried in order. Groq retires models from time to time; if one disappears
// we fall through to the next instead of breaking the app.
const MODELS = [process.env.GROQ_MODEL, "openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"].filter(
  (m, i, all): m is string => !!m && all.indexOf(m) === i,
);

export class AdvisorError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

/**
 * Calls Groq in JSON mode and runs the result through `parse`.
 * Retries once on malformed JSON, a failed parse, or a transient error.
 */
export async function askGroqJSON<T>(
  system: string,
  user: string,
  parse: (raw: Record<string, unknown>) => T,
  maxTokens = 4000,
): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new AdvisorError("GROQ_API_KEY is not configured on the server.", 500);

  const body = (model: string) =>
    JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.5,
      // Reasoning models spend tokens thinking before the JSON; leave headroom.
      max_completion_tokens: maxTokens + 4000,
      ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low", include_reasoning: false } : {}),
      response_format: { type: "json_object" },
    });

  let lastError: unknown;
  let modelIndex = 0;
  for (let attempt = 0; attempt < 3 && modelIndex < MODELS.length; attempt++) {
    const model = MODELS[modelIndex];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: body(model),
        signal: controller.signal,
      });
      if (res.status === 429) throw new AdvisorError("The AI is busy right now. Please try again in a minute.", 429);
      if (res.status === 401) throw new AdvisorError("The Groq API key is invalid.", 500);
      if (res.status === 404 || res.status === 400) {
        const text = await res.text();
        if (/model_not_found|decommissioned|does not exist/i.test(text)) {
          console.warn(`Groq model ${model} unavailable, trying next.`);
          modelIndex++;
          attempt--;
          continue;
        }
        throw new Error(`Groq ${res.status}: ${text}`);
      }
      if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = data.choices?.[0]?.message?.content ?? "";
      return parse(JSON.parse(raw));
    } catch (err) {
      if (err instanceof AdvisorError) throw err;
      lastError = err;
      console.error(`Groq attempt ${attempt + 1} (${model}) failed:`, err);
    } finally {
      clearTimeout(timer);
    }
  }
  console.error("Groq gave up:", lastError);
  throw new AdvisorError("We couldn't generate your report. Please try again.", 502);
}

/* Normalisers: coerce whatever the model returned into safe shapes. */

export const str = (v: unknown, fallback = "") => (typeof v === "string" && v.trim() ? v.trim() : fallback);
export const num = (v: unknown, lo = 0, hi = 100) => {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  return Number.isFinite(n) ? Math.round(Math.min(hi, Math.max(lo, n))) : lo;
};
export const level = (v: unknown): Level => (v === "High" || v === "Low" ? v : "Medium");
export const strs = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : []);
export const arr = (v: unknown) =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as Record<string, unknown>[]) : [];

export const salary = (v: unknown) => {
  const s = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { entry: str(s.entry, "—"), mid: str(s.mid, "—"), senior: str(s.senior, "—") };
};

export const resources = (v: unknown) =>
  arr(v)
    .map((x) => ({
      name: str(x.name),
      provider: str(x.provider),
      type: str(x.type, "Course"),
      cost: str(x.cost, "—"),
      duration: str(x.duration),
      why: str(x.why),
    }))
    .filter((x) => x.name);

export const roadmap = (v: unknown) =>
  arr(v).map((p) => ({ phase: str(p.phase), focus: str(p.focus), actions: strs(p.actions), milestone: str(p.milestone) }));

export const titled = (v: unknown) =>
  arr(v)
    .map((x) => ({ title: str(x.title), note: str(x.note) }))
    .filter((x) => x.title);
