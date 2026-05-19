import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Plan, PLAN_LIMITS, UsageInfo } from "@/types";

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const plan = profile.plan as Plan;

    let byokProvider = null;
    let byokModel = null;

    if (plan === "byok") {
      const { data: byokKey } = await supabaseAdmin
        .from("byok_keys")
        .select("provider, selected_model")
        .eq("user_id", user.id)
        .single();
      if (byokKey) {
        byokProvider = byokKey.provider;
        byokModel = byokKey.selected_model;
      }
    }

    const limit = PLAN_LIMITS[plan];
    const used =
      plan === "starter"
        ? profile.starter_optimizations_used
        : profile.optimizations_used_this_month;

    const usage: UsageInfo = {
      plan,
      country: profile.country,
      currency: profile.currency,
      used,
      limit,
      starter_expires_at: profile.starter_expires_at,
      provider: byokProvider,
      model: byokModel,
    };

    return NextResponse.json(usage);
  } catch (err) {
    console.error("Usage error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
