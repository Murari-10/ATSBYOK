"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { toast } from "@/components/Toast";
import { Plan, Currency, PRICING } from "@/types";
import { isStarterPlan, isFreePlan, isSubscriptionPlan } from "@/lib/utils/plan";

interface BillingData {
  plan: Plan;
  currency: Currency;
  used: number;
  limit: number | null;
  starter_expires_at: string | null;
  provider: string | null;
  model: string | null;
}

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
  byok: "BYOK",
};

const PLAN_BADGE: Record<Plan, string> = {
  free: "badge-free",
  starter: "badge-starter",
  pro: "badge-pro",
  elite: "badge-elite",
  byok: "badge-byok",
};

const PLAN_PRICE: Record<Plan, { INR: string; USD: string; billing: string }> = {
  free: { INR: "₹0", USD: "$0", billing: "Forever free" },
  starter: { INR: `₹${PRICING.INR.starter}`, USD: `$${PRICING.USD.starter}`, billing: "One-time" },
  pro: { INR: `₹${PRICING.INR.pro}/mo`, USD: `$${PRICING.USD.pro}/mo`, billing: "Monthly subscription" },
  elite: { INR: `₹${PRICING.INR.elite}/mo`, USD: `$${PRICING.USD.elite}/mo`, billing: "Monthly subscription" },
  byok: { INR: `₹${PRICING.INR.byok}/mo`, USD: `$${PRICING.USD.byok}/mo`, billing: "Monthly subscription" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BillingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) setBilling(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleCancelSubscription = async () => {
    if (!confirm("Cancel subscription? You keep full access until the end of your billing period.")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/payment/cancel", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Subscription cancelled. Access continues until period end.");
      } else {
        toast.error(data.error || "Could not cancel. Please email support@atsbyok.com");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setCancelling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!billing) return null;

  const { plan, currency, used, limit, starter_expires_at, provider, model } = billing;
  const price = PLAN_PRICE[plan];
  const isSubscription = isSubscriptionPlan(plan);
  const isStarter = isStarterPlan(plan);
  const isFree = isFreePlan(plan);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full">
        <h1 className="text-h1 text-gray-900 mb-8">Billing</h1>

        {/* Current Plan */}
        <div className="card mb-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-small text-gray-400 uppercase tracking-wider font-semibold mb-1">Current Plan</p>
              <div className="flex items-center gap-2.5">
                <h2 className="text-h3 text-gray-900">{PLAN_LABEL[plan]}</h2>
                <span className={PLAN_BADGE[plan]}>{PLAN_LABEL[plan]}</span>
              </div>
            </div>
            <Link href="/dashboard/pricing" className="btn-primary text-sm">
              {isFree ? "Upgrade" : "Change Plan"}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-input px-4 py-3">
              <p className="text-tiny text-gray-400 mb-0.5">Price</p>
              <p className="text-sm font-semibold text-gray-900">
                {currency === "INR" ? price.INR : price.USD}
              </p>
            </div>
            <div className="bg-gray-50 rounded-input px-4 py-3">
              <p className="text-tiny text-gray-400 mb-0.5">Billing</p>
              <p className="text-sm font-semibold text-gray-900">{price.billing}</p>
            </div>
            <div className="bg-gray-50 rounded-input px-4 py-3">
              <p className="text-tiny text-gray-400 mb-0.5">Status</p>
              <p className="text-sm font-semibold text-primary">Active</p>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="card mb-5">
          <p className="text-small text-gray-400 uppercase tracking-wider font-semibold mb-4">Usage</p>
          {plan === "byok" ? (
            <div>
              <p className="text-sm text-gray-900 font-medium">Unlimited optimizations</p>
              {provider && (
                <p className="text-small text-gray-400 mt-1">
                  via {provider} / {model}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {used} of {limit ?? "∞"} optimizations used
                  {isStarter ? " (total)" : " this month"}
                </span>
                {limit && (
                  <span className="font-medium text-gray-900">{limit - used} remaining</span>
                )}
              </div>
              {limit && (
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expiry / Renewal */}
        {isStarter && starter_expires_at && (
          <div className="card mb-5">
            <p className="text-small text-gray-400 uppercase tracking-wider font-semibold mb-3">Pack Expiry</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900 font-medium">
                  Expires on {formatDate(starter_expires_at)}
                </p>
                <p className="text-small text-gray-400 mt-0.5">
                  {new Date(starter_expires_at) < new Date()
                    ? "Your Starter pack has expired."
                    : `${Math.ceil((new Date(starter_expires_at).getTime() - Date.now()) / 86400000)} days remaining`}
                </p>
              </div>
              <Link href="/dashboard/pricing" className="btn-secondary text-sm">
                Renew / Upgrade
              </Link>
            </div>
          </div>
        )}

        {/* Cancel subscription */}
        {isSubscription && (
          <div className="card mb-5">
            <p className="text-small text-gray-400 uppercase tracking-wider font-semibold mb-3">Subscription</p>
            <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900 font-medium">Monthly subscription · auto-renews</p>
                  <p className="text-small text-gray-400 mt-0.5">Cancel anytime, no fees</p>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="btn-danger text-sm"
                >
                  {cancelling ? "Processing..." : "Cancel Subscription"}
                </button>
              </div>
          </div>
        )}

        {/* Refund policy */}
        <p className="text-small text-gray-400 text-center">
          Questions about billing?{" "}
          <a href="mailto:support@atsbyok.com" className="text-primary hover:underline">
            support@atsbyok.com
          </a>
          {" · "}
          <Link href="/refund" className="text-primary hover:underline">
            Refund Policy
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
