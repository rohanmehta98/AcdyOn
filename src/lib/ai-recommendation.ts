import { getRecommendation, type ProfileInput, type RecommendationOutput } from "./recommendation";

const VALID_RECOMMENDATIONS = ["Certification Program", "DBA", "PhD", "Honorary Doctorate"] as const;

export async function getAIRecommendation(profile: ProfileInput): Promise<RecommendationOutput> {
  const apiKey = process.env.GROQ_API_KEY;

  // Fall back to rules-based if no key is configured
  if (!apiKey) {
    return getRecommendation(profile);
  }

  const prompt = `You are an expert academic advisor. Analyse the student profile below and recommend the single most suitable academic pathway.

You MUST choose exactly one from: "Certification Program", "DBA", "PhD", "Honorary Doctorate"

Guidelines:
- Certification Program: Early-career or skill-gap professionals; limited higher education; want practical, fast credentials.
- DBA (Doctor of Business Administration): 5+ years of professional experience; business/management/leadership career goals; wants to combine practice with research.
- PhD: Research-oriented goals (academia, scientist, innovator); typically has a Bachelor's or Master's; wants to contribute original knowledge.
- Honorary Doctorate: 20+ years of distinguished career; exceptional societal, business, or academic contributions; recognised leader in their field.

Student profile:
- Highest Qualification: ${profile.highest_qualification}
- Years of Work Experience: ${profile.years_of_experience}
- Current Profession: ${profile.current_profession}
- Career Goal: ${profile.career_goal}

Respond with ONLY valid JSON — no markdown, no extra text:
{"recommendation": "<one of the four options>", "recommendation_reason": "<2-3 sentences personalised to this specific profile>"}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status, await response.text());
      return getRecommendation(profile);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Strip markdown code fences if model wraps the JSON
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

    const parsed = JSON.parse(cleaned) as { recommendation: string; recommendation_reason: string };

    if (!VALID_RECOMMENDATIONS.includes(parsed.recommendation as never)) {
      console.error("AI returned invalid recommendation:", parsed.recommendation);
      return getRecommendation(profile);
    }

    return {
      recommendation: parsed.recommendation as RecommendationOutput["recommendation"],
      recommendation_reason: parsed.recommendation_reason,
    };
  } catch (err) {
    console.error("AI recommendation failed, falling back to rules engine:", err);
    return getRecommendation(profile);
  }
}
