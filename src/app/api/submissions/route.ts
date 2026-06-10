import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch submissions error:", error);
      // Fall back to local file if Supabase is unreachable
      try {
        const file = path.join(process.cwd(), "data", "local-submissions.json");
        const content = await fs.readFile(file, "utf-8");
        const local = JSON.parse(content || "[]");
        return NextResponse.json(local, { status: 200 });
      } catch (fsErr) {
        return NextResponse.json(
          { error: "Unable to load submissions right now. Please try again later." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    console.error("Submissions API error:", error);
    // Attempt local fallback on exception
    try {
      const file = path.join(process.cwd(), "data", "local-submissions.json");
      const content = await fs.readFile(file, "utf-8");
      const local = JSON.parse(content || "[]");
      return NextResponse.json(local, { status: 200 });
    } catch (fsErr) {
      return NextResponse.json(
        { error: "Unable to load submissions right now. Please try again later." },
        { status: 500 }
      );
    }
  }
}
