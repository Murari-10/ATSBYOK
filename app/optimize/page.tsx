"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import ScoreCircle from "@/components/ScoreCircle";
import CopyButton from "@/components/CopyButton";
import LockedFeature from "@/components/LockedFeature";
import UpgradeModal from "@/components/UpgradeModal";
import { toast } from "@/components/Toast";
import { downloadAsPDF } from "@/lib/utils/pdf";
import {
  canDownloadPDF,
  canUseColdEmail,
  canUseLinkedIn,
  canUseCoverLetter,
  canUseBYOK,
} from "@/lib/utils/plan";
import { Plan, ResumeAnalysis, Currency, Suggestion } from "@/types";
import ResumePreview from "@/components/ResumePreview";
import { parseResume } from "@/lib/utils/resumeParser";

const MODES = [
  {
    id: "fresher",
    label: "Fresher / Student",
    desc: "0-2 years experience",
    icon: "🎓",
  },
  {
    id: "experienced",
    label: "Experienced",
    desc: "2+ years experience",
    icon: "💼",
  },
  { id: "mba", label: "MBA / Executive", desc: "MBA or senior roles", icon: "🏆" },
];

const PLATFORMS = [
  "Naukri",
  "LinkedIn",
  "Indeed",
  "Internshala",
  "Greenhouse",
  "Workday",
  "Lever",
  "Jobvite",
  "Generic ATS",
];

const PROGRESS_STEPS = [
  "Extracting resume...",
  "Analyzing keywords...",
  "Generating suggestions...",
  "Done!",
];


interface UsageData {
  plan: Plan;
  currency: Currency;
  used: number;
  limit: number | null;
  starter_expires_at: string | null;
  provider: string | null;
  model: string | null;
}

export default function OptimizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewId = searchParams.get("view");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const [platform, setPlatform] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setUsage(data);
      });
  }, [router]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResumeText(data.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setAnalyzing(true);
    setProgressIdx(0);

    const interval = setInterval(() => {
      setProgressIdx((prev) => Math.min(prev + 1, PROGRESS_STEPS.length - 2));
    }, 2000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          mode,
          platform,
          jobUrl,
        }),
      });
      const data = await res.json();

      clearInterval(interval);

      if (res.status === 429 && data.error) {
        setUpgradeReason(data.error);
        setAnalyzing(false);
        return;
      }

      if (data.error === "no_byok_key") {
        router.push("/settings?msg=byok_required");
        return;
      }

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setProgressIdx(PROGRESS_STEPS.length - 1);
      setTimeout(() => {
        setAnalysis(data.analysis);
        setAnalyzing(false);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      toast.error(err instanceof Error ? err.message : "Analysis failed");
      setAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!analysis) return;
    setGeneratingCoverLetter(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis_id: analysis.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis((prev) =>
        prev ? { ...prev, cover_letter: data.cover_letter } : prev
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cover letter failed");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  useEffect(() => {
    if (!viewId) return;

    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/analyses/${viewId}`);
      if (!res.ok) {
        toast.error("Could not load analysis. Please try again.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAnalysis(data as ResumeAnalysis);
      setLoading(false);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    };

    load();
  }, [viewId]); // eslint-disable-line react-hooks/exhaustive-deps

  const plan = usage?.plan || "free";
  const currency = usage?.currency || "USD";
  const canPDF = canDownloadPDF(plan);
  const canEmail = canUseColdEmail(plan);
  const canLinkedIn = canUseLinkedIn(plan);
  const canCoverLetter = canUseCoverLetter(plan);
  const isByok = canUseBYOK(plan);

  const projectedScores = analysis
    ? (() => {
        const kTotal =
          analysis.found_keywords.length + analysis.missing_keywords.length;
        const kGap = kTotal > 0 ? analysis.missing_keywords.length / kTotal : 0;
        return {
          ats: Math.min(
            analysis.ats_score +
              Math.round(
                kGap * 22 + (analysis.format_issues.length > 0 ? 5 : 2)
              ),
            95
          ),
          keyword: Math.min(
            analysis.keyword_match_score + Math.round(kGap * 28),
            97
          ),
          format: Math.min(
            analysis.format_score + (analysis.format_issues.length > 0 ? 8 : 3),
            98
          ),
        };
      })()
    : null;

  const canAnalyze =
    !!mode && !!platform && !!resumeText.trim() && !!jobDescription.trim();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          currency={currency}
          onClose={() => setUpgradeReason(null)}
        />
      )}

      <main className="flex-1 px-6 pt-10 pb-24 w-full">
        {viewId && loading ? (
          <div className="max-w-3xl mx-auto flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          </div>
        ) : !analysis ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Optimize Your Resume</h1>
              <p className="text-xs text-gray-400 mt-0.5">Fill in all 4 sections, then click Analyze.</p>
            </div>

            {/* ── Section 1 — Experience level (compact single row) ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2.5 flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${mode ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                  1
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">Experience</span>
              </div>
              <div className="flex gap-2 flex-1">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-full border text-xs font-medium transition-all ${
                      mode === m.id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Section 2 — Platform (compact single row) ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-2.5 flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${platform ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                  2
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">Platform</span>
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                      platform === p
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Sections 3 + 4 — large, side by side ── */}
            <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">

              {/* Section 3 — Resume */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5 min-h-0">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${resumeText.trim() ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                    3
                  </span>
                  <h2 className="text-sm font-semibold text-gray-800">Your Resume</h2>
                  {resumeText && (
                    <span className="ml-auto text-[10px] text-gray-400">
                      {resumeText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  )}
                </div>

                {/* Compact drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg py-3 flex items-center justify-center gap-2.5 cursor-pointer transition-colors shrink-0 ${
                    resumeText
                      ? "border-primary/30 bg-primary-50"
                      : "border-gray-200 hover:border-primary hover:bg-primary-50"
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                      Extracting...
                    </div>
                  ) : resumeText ? (
                    <p className="text-xs font-medium text-primary">✓ Loaded — drop new to replace</p>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-xs text-gray-500">
                        Drop PDF / DOCX or{" "}
                        <span className="text-primary font-semibold">browse</span>
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                <div className="relative shrink-0">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-[10px] text-gray-400">or paste text</span>
                  </div>
                </div>

                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  rows={10}
                  className="input-field resize-none font-mono text-xs flex-1 min-h-[100px]"
                />
              </div>

              {/* Section 4 — Job Description */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5 min-h-0">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${jobDescription.trim() ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                    4
                  </span>
                  <h2 className="text-sm font-semibold text-gray-800">Job Description</h2>
                </div>

                {/* URL input — no tabs, always visible */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-primary transition-colors shrink-0">
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Job URL (optional)"
                    className="flex-1 text-xs text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
                  />
                </div>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={14}
                  className="input-field resize-none text-xs flex-1 min-h-[200px]"
                />

                {isByok && (
                  <p className="text-[10px] text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5 shrink-0">
                    ⚠️ Response quality may vary by provider and model.
                  </p>
                )}
              </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Your data is secure and private.
              </span>
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || analyzing}
                className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {PROGRESS_STEPS[progressIdx]}
                  </span>
                ) : (
                  "Analyze Resume →"
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div id="results" className="max-w-6xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
              {viewId ? (
                <button onClick={() => router.push("/optimize")} className="text-sm text-primary font-medium hover:underline">
                  ← New Optimization
                </button>
              ) : (
                <button
                  onClick={() => { setAnalysis(null); setMode(""); setPlatform(""); setResumeText(""); setJobDescription(""); }}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  + New Analysis
                </button>
              )}
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] gap-6 items-start">

              {/* ── LEFT: Analysis ── */}
              <div className="space-y-4">

                {/* Score comparison */}
                {projectedScores && (
                  <div className="card overflow-hidden">
                    {/* Before / After hero */}
                    <div className="grid grid-cols-[1fr_72px_1fr] items-center">
                      {/* Before — muted */}
                      <div className="flex flex-col items-center gap-2 py-4 opacity-50">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                          Before
                        </span>
                        <ScoreCircle score={analysis.ats_score} label="ATS Score" size="lg" />
                      </div>

                      {/* Middle arrow + gain */}
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          +{projectedScores.ats - analysis.ats_score}
                        </span>
                        <span className="text-lg text-gray-300 leading-none">→</span>
                      </div>

                      {/* After — vivid */}
                      <div className="flex flex-col items-center gap-2 py-4 bg-primary-50 rounded-xl">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                          After
                        </span>
                        <ScoreCircle score={projectedScores.ats} label="ATS Score" size="lg" />
                      </div>
                    </div>

                    {/* Secondary scores */}
                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500">Keyword Match</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-400">{analysis.keyword_match_score}%</span>
                          <span className="text-gray-300 text-xs">→</span>
                          <span className="text-sm font-bold text-primary">{projectedScores.keyword}%</span>
                          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                            +{projectedScores.keyword - analysis.keyword_match_score}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500">Format Score</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-400">{analysis.format_score}%</span>
                          <span className="text-gray-300 text-xs">→</span>
                          <span className="text-sm font-bold text-primary">{projectedScores.format}%</span>
                          <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                            +{projectedScores.format - analysis.format_score}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      Projected based on applying all suggestions
                    </p>
                  </div>
                )}

                {/* Keywords */}
                <div className="card">
                  <h2 className="font-bold text-gray-900 mb-3">Keyword Analysis</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-2">✅ Found ({analysis.found_keywords.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.found_keywords.map((kw) => (
                          <span key={kw} className="bg-green-50 border border-green-200 text-green-700 text-xs px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-2">❌ Missing ({analysis.missing_keywords.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missing_keywords.map((kw) => (
                          <span key={kw} className="bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Format issues */}
                {analysis.format_issues.length > 0 && (
                  <div className="card">
                    <h2 className="font-bold text-gray-900 mb-2">Format Issues</h2>
                    <ul className="space-y-1.5">
                      {analysis.format_issues.map((issue, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-amber-500 shrink-0">âš </span>{issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                <div className="card">
                  <h2 className="font-bold text-gray-900 mb-3">Top Suggestions</h2>
                  <div className="space-y-3">
                    {(analysis.suggestions as Suggestion[]).slice(0, 5).map((s, i) => (
                      <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-900 mb-1">{i + 1}. {s.title}</p>
                        <p className="text-xs text-gray-500 mb-2">{s.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-red-50 rounded p-2">
                            <p className="text-[10px] font-medium text-red-600 mb-0.5">Before</p>
                            <p className="text-xs text-red-800">{s.before}</p>
                          </div>
                          <div className="bg-green-50 rounded p-2">
                            <p className="text-[10px] font-medium text-green-600 mb-0.5">After</p>
                            <p className="text-xs text-green-800">{s.after}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform tips */}
                {analysis.platform_specific_tips.length > 0 && (
                  <div className="card bg-blue-50 border-blue-200">
                    <h2 className="font-bold text-gray-900 mb-2">{analysis.platform} Tips</h2>
                    <ul className="space-y-1.5">
                      {analysis.platform_specific_tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm text-blue-800">
                          <span>💡</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Resume preview (sticky) ── */}
              <div className="lg:sticky lg:top-4 flex flex-col gap-0">
                {/* Panel header */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-t-xl px-4 py-2.5">
                  <h2 className="text-sm font-bold text-gray-900">Optimized Resume</h2>
                  <div className="flex items-center gap-2">
                    <CopyButton text={analysis.optimized_resume_text} label="Copy" />
                    {canPDF ? (
                      <button
                        onClick={() => {
                          const name = parseResume(analysis.optimized_resume_text).name;
                          const filename = name
                            ? `optimized-resume-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`
                            : "optimized-resume.pdf";
                          downloadAsPDF(analysis.optimized_resume_text, filename);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition-colors"
                      >
                        Download PDF
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Upgrade to download PDF"
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                      >
                        🔒 PDF
                      </button>
                    )}
                  </div>
                </div>
                {/* Resume panel body — remove top radius so it joins the header */}
                <div className="rounded-b-xl overflow-hidden border border-t-0 border-gray-200">
                  <ResumePreview
                    parsed={parseResume(analysis.optimized_resume_text)}
                    raw={analysis.optimized_resume_text}
                    plan={plan}
                    onUpgrade={() => setUpgradeReason("free_limit")}
                    compact
                  />
                </div>
              </div>
            </div>

            {/* ── Full-width below: Email, LinkedIn, Cover Letter ── */}
            <div className="mt-6 space-y-4">

              {/* Cold Email */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">âœ‰ Cold Email Template</h2>
                  {canEmail && analysis.cold_email_subject && (
                    <CopyButton text={`Subject: ${analysis.cold_email_subject}\n\n${analysis.cold_email_body ?? ""}`} label="Copy all" />
                  )}
                </div>
                {canEmail && analysis.cold_email_subject ? (
                  <div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium text-gray-500 mr-2">Subject:</span>
                        {analysis.cold_email_subject}
                      </p>
                      <CopyButton text={analysis.cold_email_subject} label="Copy" />
                    </div>
                    <div className="border-t border-gray-100 my-3" />
                    <p className="text-sm text-gray-700 leading-[1.7] whitespace-pre-wrap">{analysis.cold_email_body}</p>
                    <div className="mt-4 flex justify-end">
                      <CopyButton text={analysis.cold_email_body ?? ""} label="Copy email body" />
                    </div>
                  </div>
                ) : !canEmail ? (
                  <LockedFeature label="Cold Email Templates" requiredPlan="Starter or higher" onUpgrade={() => setUpgradeReason("free_limit")} />
                ) : (
                  <p className="text-sm text-gray-500">Cold email not generated. Re-run analysis.</p>
                )}
              </div>

              {/* LinkedIn Messages */}
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">LinkedIn Referral Messages</h2>
                {canLinkedIn && analysis.linkedin_connection_message ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">Connection Request</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${analysis.linkedin_connection_message.length > 300 ? "text-red-600" : "text-green-600"}`}>
                            {analysis.linkedin_connection_message.length} / 300
                          </span>
                          <CopyButton text={analysis.linkedin_connection_message} label="Copy" />
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900 leading-relaxed">
                        {analysis.linkedin_connection_message}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Follow-up Message</span>
                        <CopyButton text={analysis.linkedin_followup_message ?? ""} label="Copy" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {analysis.linkedin_followup_message}
                      </div>
                    </div>
                  </div>
                ) : !canLinkedIn ? (
                  <LockedFeature label="LinkedIn Messages" requiredPlan="Starter or higher" onUpgrade={() => setUpgradeReason("free_limit")} />
                ) : (
                  <p className="text-sm text-gray-500">LinkedIn messages not generated. Re-run analysis.</p>
                )}
              </div>

              {/* Cover Letter (Elite only) */}
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">Cover Letter</h2>
                {!canCoverLetter ? (
                  <LockedFeature label="Cover Letter Generator" requiredPlan="Elite" onUpgrade={() => setUpgradeReason("free_limit")} />
                ) : analysis.cover_letter ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500">Your cover letter</p>
                      <div className="flex gap-2">
                        <CopyButton text={analysis.cover_letter} />
                        <button
                          onClick={() => downloadAsPDF(analysis.cover_letter!, "cover-letter.pdf")}
                          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-600 transition-colors"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 leading-[1.7] whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                      {analysis.cover_letter}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm mb-4">Generate a tailored cover letter for this role.</p>
                    <button onClick={handleGenerateCoverLetter} disabled={generatingCoverLetter} className="btn-primary disabled:opacity-50">
                      {generatingCoverLetter ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        "Generate Cover Letter"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
