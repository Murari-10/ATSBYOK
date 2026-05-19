import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decryptKey } from "@/lib/utils/crypto";
import { callAI } from "@/lib/ai/router";
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

    const { provider, apiKey, model } = await request.json();

    if (!provider || !model) {
      return NextResponse.json(
        { error: "provider and model are required" },
        { status: 400 }
      );
    }

    // If no key typed, load and decrypt the stored key
    let resolvedKey = apiKey && apiKey !== "USE_STORED" ? apiKey : null;

    if (!resolvedKey) {
      const { data: stored } = await supabaseAdmin
        .from("byok_keys")
        .select("encrypted_api_key, provider")
        .eq("user_id", user.id)
        .single();

      if (!stored) {
        return NextResponse.json(
          { error: "No API key saved. Enter your key first." },
          { status: 400 }
        );
      }

      resolvedKey = decryptKey(stored.encrypted_api_key);
    }

    await callAI({
      provider: provider as Provider,
      model,
      systemPrompt: "You are a helpful assistant.",
      userPrompt: 'Reply with the word: OK',
      apiKey: resolvedKey,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Connection test failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
