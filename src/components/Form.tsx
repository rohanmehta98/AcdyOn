"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FormValues = {
  full_name: string;
  email: string;
  highest_qualification: string;
  years_of_experience: string;
  current_profession: string;
  career_goal: string;
};

type RecommendationResult = {
  recommendation: string;
  recommendation_reason: string;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const qualifications = [
  "High School",
  "Diploma",
  "Associate's",
  "Bachelor's",
  "Master's",
  "Postgraduate",
  "PhD",
  "Doctorate",
];

const initialValues: FormValues = {
  full_name: "",
  email: "",
  highest_qualification: "High School",
  years_of_experience: "0",
  current_profession: "",
  career_goal: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const badgeConfig: Record<string, { label: string; className: string; icon: string }> = {
  "Certification Program": { label: "Certification Program", className: "badge-cert", icon: "📜" },
  DBA: { label: "DBA", className: "badge-dba", icon: "💼" },
  PhD: { label: "PhD", className: "badge-phd", icon: "🔬" },
  "Honorary Doctorate": { label: "Honorary Doctorate", className: "badge-honor", icon: "🏆" },
};

const Form = () => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const validateField = (name: keyof FormValues, value: string) => {
    let message = "";
    if (value.trim() === "") {
      message = "This field is required.";
    } else if (name === "email" && !emailRegex.test(value)) {
      message = "Enter a valid email address.";
    } else if (name === "years_of_experience") {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0 || n > 50) {
        message = "Enter a value between 0 and 50.";
      }
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validateAll = () => {
    const errors: FieldErrors = {};
    for (const [key, value] of Object.entries(values)) {
      const name = key as keyof FormValues;
      if (value.trim() === "") {
        errors[name] = "This field is required.";
      } else if (name === "email" && !emailRegex.test(value)) {
        errors[name] = "Enter a valid email address.";
      } else if (name === "years_of_experience") {
        const n = Number(value);
        if (Number.isNaN(n) || n < 0 || n > 50) {
          errors[name] = "Enter a value between 0 and 50.";
        }
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    validateField(name as keyof FormValues, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    validateField(e.target.name as keyof FormValues, e.target.value);
  };

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleReset = () => {
    setValues(initialValues);
    setFieldErrors({});
    setError(null);
    setResult(null);
    setCopied(false);
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `I just received a personalised academic pathway recommendation from AcdyOn: ${result.recommendation}. Find yours at AcdyOn Academic Pathway!`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError("Unable to copy to clipboard. Please try manually.");
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validateAll()) {
      setError("Please complete all required fields before submitting.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.full_name,
          email: values.email,
          highest_qualification: values.highest_qualification,
          years_of_experience: Number(values.years_of_experience),
          current_profession: values.current_profession,
          career_goal: values.career_goal,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Our service is temporarily unavailable. Please try again shortly.");
        return;
      }
      setResult({ recommendation: data.recommendation, recommendation_reason: data.recommendation_reason });
    } catch {
      setError("Unable to reach the recommendation service. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const badge = result ? (badgeConfig[result.recommendation] ?? { label: result.recommendation, className: "badge-cert", icon: "🎓" }) : null;

  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white card-shadow ring-1 ring-slate-200 overflow-hidden">
      {result ? (
        /* ── Result card ── */
        <div>
          {/* Gradient header */}
          <div className="bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 px-6 py-8 sm:px-10 text-white">
            <p className="text-xs uppercase tracking-widest text-sky-200 font-semibold mb-3">
              Recommendation Ready
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {values.full_name}, your pathway is:
            </h2>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-lg font-bold">
              <span>{badge?.icon}</span>
              <span>{badge?.label}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="px-6 py-6 sm:px-10">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Why this recommendation</h3>
            <p className="text-slate-700 leading-relaxed">{result.recommendation_reason}</p>
          </div>

          {/* Profile summary */}
          <div className="mx-6 sm:mx-10 mb-6 rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Qualification</p>
              <p className="font-medium text-slate-800">{values.highest_qualification}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Experience</p>
              <p className="font-medium text-slate-800">{values.years_of_experience} year{Number(values.years_of_experience) !== 1 ? "s" : ""}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Profession</p>
              <p className="font-medium text-slate-800">{values.current_profession}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 btn-primary font-semibold text-sm"
            >
              {copied ? "✓ Copied!" : "Share Result"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/submissions"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              View All Submissions
            </Link>
          </div>
        </div>
      ) : (
        /* ── Form ── */
        <form className="px-6 py-8 sm:px-10 space-y-6" onSubmit={handleSubmit} noValidate>

          {/* Step header */}
          <div className="rounded-xl bg-sky-50 border border-sky-100 px-5 py-4">
            <p className="font-semibold text-slate-900 text-sm">Fill Your Profile</p>
            <p className="mt-0.5 text-slate-500 text-sm">Tell us about your background and career goals. All fields are required.</p>
          </div>

          {/* Full Name */}
          <Field label="Full Name" error={fieldErrors.full_name}>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Jane Smith"
              value={values.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass(!!fieldErrors.full_name)}
            />
          </Field>

          {/* Email */}
          <Field label="Email" error={fieldErrors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. jane@example.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass(!!fieldErrors.email)}
            />
          </Field>

          {/* Qualification + Experience side by side on wider screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Highest Qualification" error={fieldErrors.highest_qualification}>
              <select
                id="highest_qualification"
                name="highest_qualification"
                value={values.highest_qualification}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass(!!fieldErrors.highest_qualification)}
              >
                {qualifications.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </Field>

            <Field label="Years of Work Experience" error={fieldErrors.years_of_experience}>
              <input
                id="years_of_experience"
                name="years_of_experience"
                type="number"
                min={0}
                max={50}
                value={values.years_of_experience}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass(!!fieldErrors.years_of_experience)}
              />
            </Field>
          </div>

          {/* Current Profession */}
          <Field label="Current Profession" error={fieldErrors.current_profession}>
            <input
              id="current_profession"
              name="current_profession"
              type="text"
              placeholder="e.g. Software Engineer, Business Analyst"
              value={values.current_profession}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass(!!fieldErrors.current_profession)}
            />
          </Field>

          {/* Career Goal */}
          <Field label="Career Goal" error={fieldErrors.career_goal}>
            <textarea
              id="career_goal"
              name="career_goal"
              rows={4}
              placeholder="Describe your career aspirations — e.g. transition into research, grow into a CEO role, become a published academic..."
              value={values.career_goal}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputClass(!!fieldErrors.career_goal)} resize-none`}
            />
          </Field>

          {/* Global error */}
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 btn-primary text-base font-semibold disabled:opacity-60 transition-opacity"
          >
            {isLoading ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Analysing your profile…
              </>
            ) : (
              "Get My Recommendation →"
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            Your data is used solely to generate your recommendation and is stored securely.
          </p>
        </form>
      )}
    </div>
  );
};

/* Tiny helper components */

function inputClass(hasError: boolean) {
  return `mt-1.5 w-full rounded-xl border ${hasError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-sky-500 focus:ring-sky-200"} bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:ring-2 transition-shadow`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default Form;
