import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Razorpay from "razorpay";
import { Currency } from "@/types";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLAN_IDS: Record<string, Record<string, string>> = {
  pro: {
    INR: process.env.RAZORPAY_PLAN_ID_PRO_INR!,
    USD: process.env.RAZORPAY_PLAN_ID_PRO_USD!,
  },
  elite: {
    INR: process.env.RAZORPAY_PLAN_ID_ELITE_INR!,
    USD: process.env.RAZORPAY_PLAN_ID_ELITE_USD!,
  },
  byok: {
    INR: process.env.RAZORPAY_PLAN_ID_BYOK_INR!,
    USD: process.env.RAZORPAY_PLAN_ID_BYOK_USD!,
  },
};

const STARTER_AMOUNTS: Record<string, number> = {
  INR: 9900, // ₹99 in paise
  USD: 499,  // $4.99 in cents
};

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!["starter", "pro", "elite", "byok"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("currency, razorpay_customer_id")
      .eq("id", user.id)
      .single();

    const currency = (profile?.currency || "USD") as Currency;

    if (plan === "starter") {
      const order = await razorpay.orders.create({
        amount: STARTER_AMOUNTS[currency],
        currency: currency === "INR" ? "INR" : "USD",
        notes: {
          user_id: user.id,
          plan: "starter",
        },
      });

      return NextResponse.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      });
    }

    // Subscription plans
    const planId = PLAN_IDS[plan]?.[currency];
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID not configured" },
        { status: 500 }
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 120,
      notes: {
        user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({
      subscription_id: subscription.id,
      razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }
}
