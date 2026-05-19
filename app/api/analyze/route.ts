import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decryptKey } from "@/lib/utils/crypto";
import { safeParseJSON } from "@/lib/utils/json";
import {
  callAI,
  RESUME_SYSTEM_PROMPT,
  buildResumeUserPrompt,
  buildColdEmailPrompt,
  buildLinkedInPrompt,
} from "@/lib/ai/router";
import { getModelForPlan, getPagesForMode } from "@/lib/utils/plan";
import { Plan, PLAN_LIMITS, HOURLY_LIMITS, Provider } from "@/types";

function checkLimit(plan: Plan, profile: Record<string, unknown>): string | null {
  const now = new Date();

  if (plan === "free") {
    const used = profile.optimizations_used_this_month as number;
    const limit = PLAN_LIMITS.free!;
    if (used >= limit) return "free_limit";
  }

  if (plan === "starter") {
    const used = profile.starter_optimizations_used as number;
    if (used >= PLAN_LIMITS.starter!) return "starter_limit";
    const expiresAt = profile.starter_expires_at as string | null;
    if (!expiresAt || new Date(expiresAt) < now) return "starter_expired";
  }

  if (plan === "pro") {
    const used = profile.optimizations_used_this_month as number;
    if (used >= PLAN_LIMITS.pro!) return "pro_limit";
  }

  if (plan === "elite") {
    const used = profile.optimizations_used_this_month as number;
    if (used >= PLAN_LIMITS.elite!) return "elite_limit";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeText, jobDescription, mode, platform } = body;

    if (!resumeText || !jobDescription || !mode || !platform) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const plan = profile.plan as Plan;

    // Reset monthly counter if needed
    const resetDate = new Date(profile.optimizations_reset_date);
    const now = new Date();
    if (
      plan !== "starter" &&
      (now.getFullYear() > resetDate.getFullYear() ||
        now.getMonth() > resetDate.getMonth())
    ) {
      await supabaseAdmin
        .from("profiles")
        .update({
          optimizations_used_this_month: 0,
          optimizations_reset_date: new Date(
            now.getFullYear(),
            now.getMonth(),
            1
          )
            .toISOString()
            .split("T")[0],
        })
        .eq("id", user.id);
      profile.optimizations_used_this_month = 0;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count: hourlyCount } = await supabaseAdmin
      .from("resume_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    const hourlyLimit = HOURLY_LIMITS[plan];

    if (hourlyCount !== null && hourlyCount >= hourlyLimit) {
      return NextResponse.json(
        { error: "You have reached your hourly limit. Please try again in an hour." },
        { status: 429 }
      );
    }

    const limitCheck = checkLimit(plan, profile);
    if (limitCheck) {
      return NextResponse.json({ error: limitCheck }, { status: 429 });
    }

    // Provider priority:
    // 1. Anthropic env key (highest quality)
    // 2. User's saved BYOK key (their explicit preference, any plan)
    // 3. Env fallbacks for testing (GROQ, OPENROUTER, GEMINI)
    let provider: Provider | "anthropic" = "anthropic";
    let model = getModelForPlan(plan);
    let apiKey: string | undefined;

    if (process.env.ANTHROPIC_API_KEY) {
      // Priority 1: use Anthropic
      provider = "anthropic";
      model = getModelForPlan(plan);
    } else {
      // Priority 2: check user's saved BYOK key (works for any plan)
      const { data: savedKey } = await supabaseAdmin
        .from("byok_keys")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (savedKey) {
        provider = savedKey.provider as Provider;
        model = savedKey.selected_model;
        apiKey = decryptKey(savedKey.encrypted_api_key);
      } else if (process.env.GROQ_API_KEY) {
        // Priority 3: env fallbacks
        provider = "groq";
        model = "llama-3.3-70b-versatile";
        apiKey = process.env.GROQ_API_KEY;
      } else if (process.env.OPENROUTER_API_KEY) {
        provider = "openrouter";
        model = "meta-llama/llama-3.3-70b-instruct:free";
        apiKey = process.env.OPENROUTER_API_KEY;
      } else if (process.env.GEMINI_API_KEY) {
        provider = "gemini";
        model = "gemini-2.5-flash";
        apiKey = process.env.GEMINI_API_KEY;
      }
    }

    // BYOK plan must have a saved key
    if (plan === "byok" && !apiKey && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "no_byok_key" }, { status: 400 });
    }

    const pages = getPagesForMode(mode);

    // 1. Resume analysis
    const resumeRaw = await callAI({
      provider,
      model,
      systemPrompt: RESUME_SYSTEM_PROMPT,
      userPrompt: buildResumeUserPrompt(
        resumeText,
        jobDescription,
        mode,
        pages,
        platform
      ),
      apiKey,
    });

    const resumeResult = safeParseJSON<{
      ats_score: number;
      keyword_match_score: number;
      format_score: number;
      found_keywords: string[];
      missing_keywords: string[];
      format_issues: string[];
      suggestions: unknown[];
      platform_specific_tips: string[];
      optimized_resume: string;
    }>(resumeRaw);

    if (!resumeResult) {
      console.error("AI parse failed. Provider:", provider, "Model:", model);
      console.error("Raw response (first 500 chars):", resumeRaw?.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned an invalid response. Try again or switch to a different model in BYOK settings." },
        { status: 500 }
      );
    }

    let coldEmailSubject: string | null = null;
    let coldEmailBody: string | null = null;
    let linkedinConnection: string | null = null;
    let linkedinFollowup: string | null = null;

    // 2. Cold email (paid plans)
    if (plan !== "free") {
      try {
        const emailRaw = await callAI({
          provider,
          model,
          systemPrompt: RESUME_SYSTEM_PROMPT,
          userPrompt: buildColdEmailPrompt(
            resumeResult.optimized_resume.slice(0, 500),
            jobDescription.slice(0, 500)
          ),
          apiKey,
        });
        const emailResult = safeParseJSON<{
          subject: string;
          body: string;
        }>(emailRaw);
        if (emailResult) {
          coldEmailSubject = emailResult.subject;
          coldEmailBody = emailResult.body;
        }
      } catch (e) {
        console.error("Cold email generation failed:", e);
      }

      // 3. LinkedIn messages
      try {
        const linkedinRaw = await callAI({
          provider,
          model,
          systemPrompt: RESUME_SYSTEM_PROMPT,
          userPrompt: buildLinkedInPrompt(
            resumeResult.optimized_resume.slice(0, 500),
            jobDescription.slice(0, 500)
          ),
          apiKey,
        });
        const linkedinResult = safeParseJSON<{
          connection_request: string;
          followup_message: string;
        }>(linkedinRaw);
        if (linkedinResult) {
          linkedinConnection = linkedinResult.connection_request;
          linkedinFollowup = linkedinResult.followup_message;
        }
      } catch (e) {
        console.error("LinkedIn generation failed:", e);
      }
    }

    // Save to database
    const { data: analysis, error: saveError } = await supabaseAdmin
      .from("resume_analyses")
      .insert({
        user_id: user.id,
        original_resume_text: resumeText,
        job_description: jobDescription,
        mode,
        pages,
        platform,
        provider_used: provider,
        model_used: model,
        ats_score: resumeResult.ats_score,
        keyword_match_score: resumeResult.keyword_match_score,
        format_score: resumeResult.format_score,
        missing_keywords: resumeResult.missing_keywords,
        found_keywords: resumeResult.found_keywords,
        format_issues: resumeResult.format_issues,
        suggestions: resumeResult.suggestions,
        platform_specific_tips: resumeResult.platform_specific_tips,
        optimized_resume_text: resumeResult.optimized_resume,
        cold_email_subject: coldEmailSubject,
        cold_email_body: coldEmailBody,
        linkedin_connection_message: linkedinConnection,
        linkedin_followup_message: linkedinFollowup,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    // Increment usage counter
    if (plan === "starter") {
      await supabaseAdmin
        .from("profiles")
        .update({
          starter_optimizations_used: profile.starter_optimizations_used + 1,
        })
        .eq("id", user.id);
    } else {
      await supabaseAdmin
        .from("profiles")
        .update({
          optimizations_used_this_month:
            profile.optimizations_used_this_month + 1,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
