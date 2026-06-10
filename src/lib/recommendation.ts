export type ProfileInput = {
  highest_qualification: string;
  years_of_experience: number;
  current_profession: string;
  career_goal: string;
};

export type RecommendationOutput = {
  recommendation: "Certification Program" | "DBA" | "PhD" | "Honorary Doctorate";
  recommendation_reason: string;
};

const containsKeyword = (text: string, keywords: string[]) => {
  const normalized = text.toLowerCase();
  return keywords.some((kw) => normalized.includes(kw.toLowerCase()));
};

export function getRecommendation(profile: ProfileInput): RecommendationOutput {
  const qual = profile.highest_qualification.trim();
  const exp = profile.years_of_experience;
  const combined = `${profile.career_goal} ${profile.current_profession}`.toLowerCase();
  const prof = profile.current_profession.trim();

  // Honorary Doctorate — long career or senior leadership
  const seniorTitles = ["ceo", "founder", "president", "director general", "minister", "chancellor", "chairman"];
  const isHonorary =
    exp >= 25 ||
    (exp >= 20 && (qual === "PhD" || qual === "Doctorate")) ||
    (exp >= 18 && containsKeyword(combined, seniorTitles));

  if (isHonorary) {
    return {
      recommendation: "Honorary Doctorate",
      recommendation_reason: `With ${exp} years of distinguished career experience as a ${prof}, your contributions go well beyond conventional academic metrics. An Honorary Doctorate is the highest recognition for lifelong impact, thought leadership, and sustained excellence — a testament to what you have built and who you have influenced.`,
    };
  }

  // PhD — research/academic orientation, typically earlier in career
  const phdKeywords = [
    "research", "academia", "professor", "scientist", "innovate", "phd",
    "develop", "publish", "study", "theory", "lab", "academic", "thesis",
    "dissertation", "postdoc", "scholarship", "knowledge",
  ];
  const phdQuals = ["Bachelor's", "Master's", "Postgraduate", "Associate's"];
  const isPhD =
    phdQuals.includes(qual) &&
    exp <= 15 &&
    containsKeyword(combined, phdKeywords);

  if (isPhD) {
    return {
      recommendation: "PhD",
      recommendation_reason: `Your ${qual} qualification combined with ${exp} year${exp !== 1 ? "s" : ""} of experience and clearly research-driven goals make you a strong PhD candidate. This path will let you generate original knowledge, publish peer-reviewed work, and position yourself at the frontier of your field — opening doors to academia, R&D labs, and expert consulting.`,
    };
  }

  // DBA — business leadership with meaningful professional experience
  const dbaKeywords = [
    "business", "management", "leadership", "executive", "entrepreneur",
    "ceo", "strategy", "corporate", "operations", "finance", "consulting",
    "enterprise", "organisation", "organization", "venture", "director",
    "manager", "growth", "startup",
  ];
  const dbaQuals = ["Bachelor's", "Master's", "Postgraduate", "Diploma"];
  const isDBA =
    exp >= 5 &&
    dbaQuals.includes(qual) &&
    containsKeyword(combined, dbaKeywords);

  if (isDBA) {
    return {
      recommendation: "DBA",
      recommendation_reason: `With ${exp} years of hands-on experience in ${prof} and leadership-oriented goals, a Doctor of Business Administration (DBA) is your ideal next step. It bridges practitioner expertise with rigorous business research — positioning you for C-suite roles, board-level advisory, and strategic influence at the highest levels of industry.`,
    };
  }

  // Default — Certification Program
  return {
    recommendation: "Certification Program",
    recommendation_reason: `Based on your ${qual} background and ${exp} year${exp !== 1 ? "s" : ""} of experience in ${prof}, a targeted Certification Program is the most effective next move. It will sharpen domain-specific skills, add credible credentials to your profile, and directly accelerate progress toward your career goals — with measurable ROI in the shortest time.`,
  };
}
