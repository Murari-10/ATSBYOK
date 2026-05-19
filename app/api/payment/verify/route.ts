import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
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
    const {
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id,
    } = body;

    // Verify for one-time orders
    if (razorpay_order_id) {
      const valid = verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    // Verify for subscription payments
    if (razorpay_subscription_id) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 400 }
        );
      }
    }

    const now = new Date();
    const thirtyDaysLater = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (plan === "starter") {
      await supabaseAdmin
        .from("profiles")
        .update({
          plan: "starter",
          starter_purchased_at: now.toISOString(),
          starter_expires_at: thirtyDaysLater.toISOString(),
          starter_optimizations_used: 0,
          razorpay_payment_id,
        })
        .eq("id", user.id);
    } else {
      await supabaseAdmin
        .from("profiles")
        .update({
          plan,
          razorpay_subscription_id,
          razorpay_payment_id,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
