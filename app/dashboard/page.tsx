import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Plan, ResumeAnalysis, PLAN_LIMITS } from "@/types";
import { canUseBYOK, isStarterPlan, isSubscriptionPlan } from "@/lib/utils/plan";

function getATSColor(score: number): string {
  if (score >= 75) return "bg-green-100 text-green-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function getPlanLabel(plan: Plan): string {
  const labels: Record<Plan, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    elite: "Elite",
    byok: "BYOK",
  };
  return labels[plan];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: analyses } = await supabaseAdmin
    .from("resume_analyses")
    .select(
      "id, created_at, platform, ats_score, mode"
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const plan = profile.plan as Plan;
  const limit = PLAN_LIMITS[plan];
  const used =
    isStarterPlan(plan)
      ? profile.starter_optimizations_used
      : profile.optimizations_used_this_month;

  const isStarterExpiringSoon =
    plan === "starter" &&
    profile.starter_expires_at &&
    new Date(profile.starter_expires_at).getTime() - Date.now() <
      3 * 24 * 60 * 60 * 1000;

  let byokProvider: string | null = null;
  let byokModel: string | null = null;
  if (canUseBYOK(plan)) {
    const { data: byokKey } = await supabaseAdmin
      .from("byok_keys")
      .select("provider, selected_model")
      .eq("user_id", session.user.id)
      .single();
    if (byokKey) {
      byokProvider = byokKey.provider;
      byokModel = byokKey.selected_model;
    }
  }

  const usagePercent =
    limit !== null ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-10 pb-24 w-full">
        {/* Expiry warning */}
        {isStarterExpiringSoon && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium text-amber-800">
                Your Starter pack expires on{" "}
                {formatDate(profile.starter_expires_at!)}. Upgrade to continue
                optimizing.
              </p>
            </div>
            <Link
              href="/pricing"
              className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              Upgrade
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Usage card */}
          <div className="lg:col-span-2 card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Your Usage
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`badge ${
                      {
                        free: "bg-gray-100 text-gray-700",
                        starter: "bg-blue-100 text-blue-700",
                        pro: "bg-primary-100 text-primary-700",
                        elite: "bg-purple-100 text-purple-700",
                        byok: "bg-orange-100 text-orange-700",
                      }[plan]
                    }`}
                  >
                    {getPlanLabel(plan)} Plan
                  </span>
                </div>
              </div>
              <Link href="/pricing" className="text-sm text-primary font-medium hover:underline">
                Upgrade
              </Link>
            </div>

            {canUseBYOK(plan) ? (
              <p className="text-gray-700 font-medium">
                Unlimited optimizations
                {byokProvider && (
                  <span className="text-gray-500 font-normal ml-2">
                    via {byokProvider} / {byokModel}
                  </span>
                )}
              </p>
            ) : (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {used} of {limit ?? "∞"} optimizations used
                    {plan === "starter" && " (total)"}
                    {isSubscriptionPlan(plan) && " this month"}
                  </span>
                  {limit !== null && limit > 0 && (
                    <span className="font-medium text-gray-900">
                      {limit - used} remaining
                    </span>
                  )}
                </div>
                {limit !== null && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        usagePercent >= 90
                          ? "bg-red-500"
                          : usagePercent >= 70
                          ? "bg-amber-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                )}
                {plan === "starter" && profile.starter_expires_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Expires on {formatDate(profile.starter_expires_at)}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Quick action */}
          <div className="card flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-br from-primary-50 to-white border-primary-100">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">New Optimization</h3>
              <p className="text-xs text-gray-500 mt-1">
                Optimize your resume for any job
              </p>
            </div>
            <Link href="/optimize" className="btn-primary w-full py-2.5">
              Start Now
            </Link>
          </div>
        </div>

        {/* Past analyses */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Past Analyses</h2>
            {analyses && analyses.length > 0 && (
              <span className="text-xs text-gray-400">{analyses.length} total</span>
            )}
          </div>
          {!analyses || analyses.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-gray-700 font-semibold mb-1">No analyses yet</p>
              <p className="text-sm text-gray-400 mb-6">Optimize your first resume to see results here</p>
              <Link href="/optimize" className="btn-primary px-8">
                Start Optimizing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(analyses as Partial<ResumeAnalysis>[]).map((a) => (
                <div
                  key={a.id}
                  className="card flex items-center justify-between hover:border-primary-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">
                      📄
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {a.platform}
                        <span className="text-gray-400 font-normal mx-1.5">·</span>
                        <span className="capitalize text-gray-600 font-normal">
                          {a.mode}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(a.created_at!)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${getATSColor(
                        a.ats_score!
                      )}`}
                    >
                      {a.ats_score}% ATS
                    </span>
                    <Link
                      href={`/optimize?view=${a.id}`}
                      className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
