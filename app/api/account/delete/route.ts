import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const email = session.user.email;

  // Record email before deletion so re-registration starts at the free limit
  if (email) {
    await supabaseAdmin
      .from("deleted_accounts")
      .upsert({ email }, { onConflict: "email" });
  }

  await supabaseAdmin
    .from("resume_analyses")
    .delete()
    .eq("user_id", userId);

  await supabaseAdmin
    .from("byok_keys")
    .delete()
    .eq("user_id", userId);

  await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId);

  await supabaseAdmin.auth.admin.deleteUser(userId);

  return NextResponse.json({ success: true });
}
