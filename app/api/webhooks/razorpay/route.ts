import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

function verifyWebhook(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    if (!verifyWebhook(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    if (eventType === "subscription.charged") {
      const subId = event.payload.subscription.entity.id;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, plan, optimizations_reset_date")
        .eq("razorpay_subscription_id", subId)
        .single();

      if (profile) {
        const now = new Date();
        const resetDate = new Date(profile.optimizations_reset_date);
        const isNewMonth =
          now.getMonth() !== resetDate.getMonth() ||
          now.getFullYear() !== resetDate.getFullYear();

        await supabaseAdmin
          .from("profiles")
          .update({
            razorpay_subscription_id: subId,
            ...(isNewMonth
              ? {
                  optimizations_used_this_month: 0,
                  optimizations_reset_date: now.toISOString().split("T")[0],
                }
              : {}),
          })
          .eq("id", profile.id);
      }
    }

    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.completed"
    ) {
      const subscriptionId = event.payload.subscription.entity.id;
      await supabaseAdmin
        .from("profiles")
        .update({ plan: "free", razorpay_subscription_id: null })
        .eq("razorpay_subscription_id", subscriptionId);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
