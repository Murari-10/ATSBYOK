"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import { Plan, Currency, PRICING } from "@/types";
import { isFreePlan } from "@/lib/utils/plan";

interface UsageData {
  plan: Plan;
  currency: Currency;
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["ATS Score", "Keyword Analysis", "Improvement Suggestions", "Copy Resume Text"],
  starter: ["All Free features", "Download PDF", "Cold Email Template", "LinkedIn Messages"],
  pro: ["All Starter features", "30 optimizations/month", "Smarter analysis engine"],
  elite: ["All Pro features", "100 optimizations/month", "Cover Letter Generator"],
  byok: ["Unlimited optimizations", "Use your own free API key", "PDF + Email + LinkedIn", "AES-256 encrypted key"],
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function InAppPricingPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setUsage(d); });
  }, [router]);

  const currentPlan = usage?.plan || "free";
  const currency = usage?.currency || "USD";
  const isINR = currency === "INR";

  const plans = [
    {
      id: "free" as Plan,
      name: "Free",
      price: 0,
      billing: "forever",
      optimizations: "2/month",
      color: "border-gray-200",
      highlight: "",
    },
    {
      id: "starter" as Plan,
      name: "Starter",
      price: isINR ? PRICING.INR.starter : PRICING.USD.starter,
      billing: "one-time",
      optimizations: "15 total (30 days)",
      color: "border-blue-200 bg-blue-50",
      highlight: "Just getting started?",
    },
    {
      id: "pro" as Plan,
      name: "Pro",
      price: isINR ? PRICING.INR.pro : PRICING.USD.pro,
      billing: "/month",
      optimizations: "30/month",
      color: "border-primary bg-primary-50",
      highlight: "Most Popular",
      popular: true,
    },
    {
      id: "elite" as Plan,
      name: "Elite",
      price: isINR ? PRICING.INR.elite : PRICING.USD.elite,
      billing: "/month",
      optimizations: "100/month",
      color: "border-purple-200 bg-purple-50",
      highlight: "Best for Active Job Seekers",
    },
    {
      id: "byok" as Plan,
      name: "BYOK",
      price: isINR ? PRICING.INR.byok : PRICING.USD.byok,
      billing: "/month",
      optimizations: "Unlimited",
      color: "border-orange-200 bg-orange-50",
      highlight: "Use Your Free API Key",
    },
  ];

  const formatPrice = (price: number) => {
    if (price === 0) return isINR ? "₹0" : "$0";
    const sym = isINR ? "₹" : "$";
    return `${sym}${price % 1 === 0 ? price : price.toFixed(2)}`;
  };

  const handleUpgrade = async (planId: Plan) => {
    if (isFreePlan(planId) || planId === currentPlan) return;
    setLoading(planId);
    setMessage(null);

    // Load Razorpay script if not loaded
    if (!window.Razorpay) {
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    }

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const options: Record<string, unknown> = {
        key: data.razorpay_key,
        name: "ATSBYOK",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        currency,
        theme: { color: "#1D9E75" },
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: planId, ...response }),
          });
          if (verifyRes.ok) {
            setMessage({ type: "success", text: `Upgraded to ${planId} successfully!` });
            setTimeout(() => window.location.reload(), 1500);
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      };

      if (data.order_id) {
        options.order_id = data.order_id;
        options.amount = data.amount;
      } else {
        options.subscription_id = data.subscription_id;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Payment failed",
      });
      setLoading(null);
    }
  };

  const getCtaLabel = (planId: Plan, planName: string) => {
    if (planId === currentPlan) return "Current Plan";
    if (planId === "free") return "Downgrade";
    return `Upgrade to ${planName}`;
  };

  const getCtaStyle = (planId: Plan, popular?: boolean) => {
    if (planId === currentPlan) {
      return "w-full py-2.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed";
    }
    if (popular) {
      return "w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-600 transition-colors disabled:opacity-50";
    }
    return "w-full py-2.5 rounded-lg text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary transition-colors disabled:opacity-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-10 pb-24 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Plans & Pricing
          </h1>
          <p className="text-gray-500">
            Prices in {isINR ? "Indian Rupees (₹)" : "US Dollars ($)"}
          </p>
        </div>

        {message && (
          <div
            className={`max-w-md mx-auto mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-5 flex flex-col ${plan.color} ${
                  isCurrent ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Current Plan
                  </div>
                )}
                {!isCurrent && plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                {plan.highlight && !plan.popular && (
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    {plan.highlight}
                  </p>
                )}

                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{plan.billing}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{plan.optimizations}</p>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {PLAN_FEATURES[plan.id].map((f) => (
                    <li key={f} className="flex gap-2 text-xs text-gray-700">
                      <span className="text-green-500 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || loading === plan.id || plan.id === "free"}
                  className={getCtaStyle(plan.id, plan.popular)}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    getCtaLabel(plan.id, plan.name)
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Payments processed securely by Razorpay. Cancel subscriptions anytime from Settings.
        </p>
      </main>
      <Footer />
    </div>
  );
}
