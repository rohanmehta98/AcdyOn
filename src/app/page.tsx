import type { Metadata } from "next";
import RecommendationSection from "@/components/RecommendationSection";

export const metadata: Metadata = {
  title: "Academic Pathway Recommendation | AcdyOn",
  description:
    "Answer a few questions and get a personalized academic pathway recommendation.",
};

export default function Home() {
  return <RecommendationSection />;
}
