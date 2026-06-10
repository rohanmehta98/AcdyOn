import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAIRecommendation } from "@/lib/ai-recommendation";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmissionInput = {
  full_name: string;
  email: string;
  highest_qualification: string;
  years_of_experience: number;
  current_profession: string;
  career_goal: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SubmissionInput>;

    const requiredFields: Array<keyof SubmissionInput> = [
      "full_name",
      "email",
      "highest_qualification",
      "years_of_experience",
      "current_profession",
      "career_goal",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required field(s): ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    if (!emailRegex.test(body.email ?? "")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const submissionData: SubmissionInput = {
      full_name: body.full_name!,
      email: body.email!,
      highest_qualification: body.highest_qualification!,
      years_of_experience: body.years_of_experience!,
      current_profession: body.current_profession!,
      career_goal: body.career_goal!,
    };

    const { recommendation, recommendation_reason } = await getAIRecommendation(submissionData);

    try {
      const { data, error } = await supabase
        .from("submissions")
        .insert([{ ...submissionData, recommendation, recommendation_reason }])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        // fall through to local fallback below
        throw error;
      }

      return NextResponse.json(data, { status: 200 });
    } catch (supabaseErr) {
      console.error("Supabase insert error:", supabaseErr);
      // Attempt local fallback: write to data/local-submissions.json
      try {
        const fileDir = path.join(process.cwd(), "data");
        const file = path.join(fileDir, "local-submissions.json");
        await fs.mkdir(fileDir, { recursive: true });

        let local: Record<string, unknown>[] = [];
        try {
          const content = await fs.readFile(file, "utf-8");
          local = JSON.parse(content || "[]") as Record<string, unknown>[];
        } catch {
          local = [];
        }

        const record = {
          id: randomUUID(),
          ...submissionData,
          recommendation,
          recommendation_reason,
          created_at: new Date().toISOString(),
        };

        local.unshift(record);
        await fs.writeFile(file, JSON.stringify(local, null, 2), "utf-8");

        return NextResponse.json(record, { status: 200 });
      } catch (fsErr) {
        console.error("Local fallback write error:", fsErr);
        return NextResponse.json(
          { error: "Unable to save submission. Please try again later." },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Submit API error:", error);
    return NextResponse.json(
      { error: "Unable to submit at this time. Please try again later." },
      { status: 500 }
    );
  }
}
