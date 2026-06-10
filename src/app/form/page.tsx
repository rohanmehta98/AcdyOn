import type { Metadata } from "next";
import Link from "next/link";
import Form from "@/components/Form";

export const metadata: Metadata = {
  title: "Get Recommendation | AcdyOn",
  description: "Fill out the form to receive your personalised academic pathway recommendation.",
};

export default function FormPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:py-10 sm:px-6 lg:px-8">
      <div className="mx-auto container-lg">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Get Recommendation</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Your Academic Pathway
          </h1>
          <p className="mt-2 text-slate-500">
            Fill in your profile below and we will match you to the most suitable academic pathway.
          </p>
        </div>

        <Form />

      </div>
    </div>
  );
}
