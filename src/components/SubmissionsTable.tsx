"use client";

import { useEffect, useState } from "react";

type Submission = {
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
};

const badgeClass: Record<string, string> = {
  "Certification Program": "badge-cert",
  DBA: "badge-dba",
  PhD: "badge-phd",
  "Honorary Doctorate": "badge-honor",
};

const badgeIcon: Record<string, string> = {
  "Certification Program": "📜",
  DBA: "💼",
  PhD: "🔬",
  "Honorary Doctorate": "🏆",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).replace(",", "");

const truncate = (text: string, n: number) =>
  text.length <= n ? text : `${text.slice(0, n)}…`;

const ALL_RECOMMENDATIONS = ["Certification Program", "DBA", "PhD", "Honorary Doctorate"];

const SubmissionsTable = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRec, setFilterRec] = useState("All");

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load submissions");
      setSubmissions(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  /* Stats */
  const counts = ALL_RECOMMENDATIONS.reduce<Record<string, number>>((acc, r) => {
    acc[r] = submissions.filter((s) => s.recommendation === r).length;
    return acc;
  }, {});

  /* Filtered list */
  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.career_goal.toLowerCase().includes(q) ||
      s.current_profession.toLowerCase().includes(q);
    const matchFilter = filterRec === "All" || s.recommendation === filterRec;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ALL_RECOMMENDATIONS.map((rec) => (
          <button
            key={rec}
            type="button"
            onClick={() => setFilterRec(filterRec === rec ? "All" : rec)}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
              filterRec === rec
                ? "ring-2 ring-sky-500 border-sky-300 bg-sky-50"
                : "bg-white border-slate-200 hover:border-slate-300"
            } card-shadow`}
          >
            <p className="text-lg font-black text-slate-900">{isLoading ? "—" : counts[rec]}</p>
            <p className="mt-0.5 text-xs text-slate-500 leading-snug flex items-center gap-1">
              <span>{badgeIcon[rec]}</span> {rec}
            </p>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl bg-white card-shadow ring-1 ring-slate-200">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <p className="text-xl font-bold text-slate-900">
              {isLoading ? "—" : filtered.length}
              <span className="ml-1.5 text-sm font-normal text-slate-400">
                {filterRec === "All" ? "total submissions" : filterRec}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              placeholder="Search by name, email, profession…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-shadow"
            />
            <div className="flex gap-2">
              {filterRec !== "All" && (
                <button
                  type="button"
                  onClick={() => setFilterRec("All")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Clear filter
                </button>
              )}
              <button
                type="button"
                onClick={fetchSubmissions}
                disabled={isLoading}
                className="rounded-xl px-4 py-2 text-sm font-semibold btn-primary disabled:opacity-60"
              >
                {isLoading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-100">
                <th className="px-4 py-3 w-8">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 hidden md:table-cell">Qualification</th>
                <th className="px-4 py-3 hidden md:table-cell">Exp.</th>
                <th className="px-4 py-3 hidden lg:table-cell">Career Goal</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3 hidden xl:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-3.5 rounded-full bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                        {search || filterRec !== "All"
                          ? "No submissions match your search."
                          : "No submissions yet. Be the first to get your pathway recommendation!"}
                      </td>
                    </tr>
                  )
                : filtered.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-slate-400 tabular-nums">{idx + 1}</td>
                      <td className="px-4 py-4 font-medium text-slate-900 whitespace-nowrap">{s.full_name}</td>
                      <td className="px-4 py-4 text-slate-500 hidden sm:table-cell">{s.email}</td>
                      <td className="px-4 py-4 text-slate-500 hidden md:table-cell">{s.highest_qualification}</td>
                      <td className="px-4 py-4 text-slate-500 hidden md:table-cell whitespace-nowrap">{s.years_of_experience} yr{s.years_of_experience !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-4 text-slate-500 hidden lg:table-cell max-w-xs" title={s.career_goal}>
                        {truncate(s.career_goal, 55)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${badgeClass[s.recommendation] ?? "badge-cert"}`}>
                          <span>{badgeIcon[s.recommendation] ?? "🎓"}</span>
                          {s.recommendation}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400 hidden xl:table-cell whitespace-nowrap">
                        {formatDate(s.created_at)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsTable;
