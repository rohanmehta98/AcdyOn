import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Fill Your Profile",
    description: "Share your qualification, experience, profession, and career goals in under 2 minutes.",
  },
  {
    number: "02",
    title: "Get Instant Analysis",
    description: "Our rules-based engine evaluates your profile against proven academic pathways.",
  },
  {
    number: "03",
    title: "Receive Your Recommendation",
    description: "Get a personalised recommendation — Certification, DBA, PhD, or Honorary Doctorate — with clear reasoning.",
  },
];

const pathways = [
  {
    label: "Certification Program",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    dot: "bg-blue-500",
    desc: "Skill-building and credential validation",
  },
  {
    label: "DBA",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    dot: "bg-orange-500",
    desc: "Business leadership & applied research",
  },
  {
    label: "PhD",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    dot: "bg-purple-500",
    desc: "Original research & academic excellence",
  },
  {
    label: "Honorary Doctorate",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    dot: "bg-amber-500",
    desc: "Lifetime achievement recognition",
  },
];

export default function RecommendationSection() {
  return (
    <div className="bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto container-lg space-y-10">

        {/* Hero */}
        <section className="rounded-2xl hero-bg px-6 py-12 sm:px-10 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">
              Academic Pathway Recommendation
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl hero-title">
              Find the right academic pathway for you
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
              Answer a few quick questions and receive a clear, rules-based academic recommendation tailored to your background and goals.
            </p>
            <div className="mt-8">
              <Link
                href="/form"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold btn-primary shadow-md hover:opacity-90 transition-opacity"
              >
                Get My Recommendation →
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-2xl bg-white px-6 py-10 sm:px-10 card-shadow ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <p className="mt-2 text-slate-500">Three simple steps to your personalised recommendation.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white shadow-md">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pathways */}
        <section className="rounded-2xl bg-white px-6 py-10 sm:px-10 card-shadow ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Possible Pathways</h2>
          <p className="mt-2 text-slate-500">Your profile is matched against four academic pathways.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pathways.map((p) => (
              <div key={p.label} className={`rounded-xl border px-4 py-5 ${p.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                  <span className="font-semibold text-sm">{p.label}</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA bottom */}
        <section className="rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-10 sm:px-10 text-white text-center">
          <h2 className="text-2xl font-bold">Ready to find your path?</h2>
          <p className="mt-2 text-sky-100">Takes less than 2 minutes. No account required.</p>
          <div className="mt-6">
            <Link
              href="/form"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-sky-700 shadow hover:bg-sky-50 transition-colors"
            >
              Start Now →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
