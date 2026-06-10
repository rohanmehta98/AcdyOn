import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { getAIRecommendation } from "@/lib/ai-recommendation";

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

    // Generate recommendation — AI with rules-based fallback
    const { recommendation, recommendation_reason } = await getAIRecommendation(submissionData);

    // Build the response record regardless of DB outcome
    const record = {
      id: randomUUID(),
      ...submissionData,
      recommendation,
      recommendation_reason,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase — best effort, never blocks the response
    try {
      const { error } = await supabase
        .from("submissions")
        .insert([{ ...submissionData, recommendation, recommendation_reason }]);

      if (error) {
        console.error("Supabase insert error:", error.message, error.code);
      }
    } catch (dbErr) {
      console.error("Supabase unexpected error:", dbErr);
    }

    // Always return the recommendation to the user
    return NextResponse.json(record, { status: 200 });

  } catch (error) {
    console.error("Submit API error:", error);
    return NextResponse.json(
      { error: "Unable to process your submission. Please try again." },
      { status: 500 }
    );
  }
}
