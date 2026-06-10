import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error.message, error.code);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    console.error("Submissions API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
