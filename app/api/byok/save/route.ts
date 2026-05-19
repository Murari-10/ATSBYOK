import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { encryptKey } from "@/lib/utils/crypto";

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: "provider, apiKey, and model are required" },
        { status: 400 }
      );
    }

    const encrypted = encryptKey(apiKey);

    const { error } = await supabaseAdmin.from("byok_keys").upsert(
      {
        user_id: user.id,
        provider,
        encrypted_api_key: encrypted,
        selected_model: model,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("BYOK save error:", error);
      return NextResponse.json({ error: "Failed to save key" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("BYOK save error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
