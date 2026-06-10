import { createClient } from "@supabase/supabase-js";

export interface Submission {
  id: string;
  full_name: string;
  email: string;
  highest_qualification: string;
  years_of_experience: number;
  current_profession: string;
  career_goal: string;
  recommendation: string;
  recommendation_reason: string;
  created_at: string;
}

const fetchWithTimeout: typeof fetch = (url, options) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  {
    global: { fetch: fetchWithTimeout },
  }
);
