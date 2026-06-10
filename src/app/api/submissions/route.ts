import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Surface missing env vars clearly
  if (!url || !key) {
    return NextResponse.json(
      { error: "SUPABASE_ENV_MISSING", detail: `URL: ${!!url}, KEY: ${!!key}` },
      { status: 500 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { error: error.message, code: error.code, hint: error.hint },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Submissions API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
