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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anonKey;

// Public client — used client-side (respects RLS)
export const supabase = createClient(url, anonKey);

// Admin client — used in server-side API routes only (bypasses RLS)
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
