import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decryptKey } from "@/lib/utils/crypto";
import { safeParseJSON } from "@/lib/utils/json";
import {
  callAI,
  RESUME_SYSTEM_PROMPT,
  buildCoverLetterPrompt,
} from "@/lib/ai/router";
import { Provider } from "@/types";

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan !== "elite") {
      return NextResponse.json(
        { error: "Cover letter is an Elite plan feature" },
        { status: 403 }
      );
    }

    const { analysis_id } = await request.json();
    if (!analysis_id) {
      return NextResponse.json(
        { error: "analysis_id required" },
        { status: 400 }
      );
    }

    const { data: analysis } = await supabaseAdmin
      .from("resume_analyses")
      .select("original_resume_text, optimized_resume_text, job_description, mode")
      .eq("id", analysis_id)
      .eq("user_id", user.id)
      .single();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const { data: byokKey } = await supabaseAdmin
      .from("byok_keys")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let clProvider: Provider | "anthropic" = "anthropic";
    let clModel = "claude-sonnet-4-6";
    let clKey: string | undefined;

    if (process.env.ANTHROPIC_API_KEY) {
      clProvider = "anthropic";
      clModel = "claude-sonnet-4-6";
    } else if (byokKey) {
      clProvider = byokKey.provider as Provider;
      clModel = byokKey.selected_model;
      clKey = decryptKey(byokKey.encrypted_api_key);
    } else if (process.env.GROQ_API_KEY) {
      clProvider = "groq";
      clModel = "llama-3.3-70b-versatile";
      clKey = process.env.GROQ_API_KEY;
    } else if (process.env.OPENROUTER_API_KEY) {
      clProvider = "openrouter";
      clModel = "meta-llama/llama-3.3-70b-instruct:free";
      clKey = process.env.OPENROUTER_API_KEY;
    } else {
      clProvider = "gemini";
      clModel = "gemini-2.5-flash";
      clKey = process.env.GEMINI_API_KEY;
    }

    const coverLetterRaw = await callAI({
      provider: clProvider as Provider,
      model: clModel,
      apiKey: clKey,
      systemPrompt: RESUME_SYSTEM_PROMPT,
      userPrompt: buildCoverLetterPrompt(
        analysis.optimized_resume_text || analysis.original_resume_text,
        analysis.job_description,
        analysis.mode
      ),
    });

    const result = safeParseJSON<{ cover_letter: string }>(coverLetterRaw);
    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate cover letter" },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("resume_analyses")
      .update({ cover_letter: result.cover_letter })
      .eq("id", analysis_id);

    return NextResponse.json({ cover_letter: result.cover_letter });
  } catch (err) {
    console.error("Cover letter error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
