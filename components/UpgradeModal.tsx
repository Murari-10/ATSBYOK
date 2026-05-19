"use client";

import { useState } from "react";
import { Currency, PRICING } from "@/types";
import { formatCurrency } from "@/lib/utils/plan";

interface UpgradeModalProps {
  reason: string;
  currency: Currency;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    billing: "one-time",
    optimizations: "15 optimizations · 30 days",
    badge: null,
    cardClass: "border-gray-200 bg-white",
    priceClass: "text-gray-900",
    btnClass: "border border-gray-300 text-gray-700 hover:border-primary hover:text-primary",
    features: [
      "ATS Score & Analysis",
      "Download PDF",
      "Cold Email Templates",
      "LinkedIn Messages",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    billing: "/month",
    optimizations: "30 optimizations/month",
    badge: "Most Popular",
    badgeClass: "bg-primary text-white",
    cardClass: "border-primary bg-primary-50",
    priceClass: "text-primary",
    btnClass: "bg-primary text-white hover:bg-primary-hover",
    features: [
      "ATS Score & Analysis",
      "Download PDF",
      "Cold Email Templates",
      "LinkedIn Messages",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    billing: "/month",
    optimizations: "100 optimizations/month",
    badge: "Best Value",
    badgeClass: "bg-purple-600 text-white",
    cardClass: "border-purple-200 bg-purple-50",
    priceClass: "text-purple-700",
    btnClass: "bg-purple-600 text-white hover:bg-purple-700",
    features: [
      "ATS Score & Analysis",
      "Download PDF",
      "Cold Email Templates",
      "LinkedIn Messages",
      "Cover Letter Generator",
    ],
  },
  {
    id: "byok",
    name: "BYOK",
    billing: "/month",
    optimizations: "Unlimited optimizations",
    badge: "Free API Key",
    badgeClass: "bg-orange-500 text-white",
    cardClass: "border-orange-200 bg-orange-50",
    priceClass: "text-orange-600",
    btnClass: "bg-orange-500 text-white hover:bg-orange-600",
    features: [
      "Unlimited optimizations",
      "Download PDF",
      "Cold Email Templates",
      "LinkedIn Messages",
      "Full API control",
    ],
  },
];

const reasonMessages: Record<string, string> = {
  free_limit: "You've used all 2 free optimizations this month.",
  starter_limit: "You've used all 15 Starter optimizations.",
  starter_expired: "Your Starter pack has expired.",
  pro_limit: "You've used all 30 Pro optimizations this month.",
  elite_limit: "You've used all 100 Elite optimizations this month.",
};

export default function UpgradeModal({ reason, currency, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const getPrice = (id: string) => {
    if (id === "starter") return currency === "INR" ? PRICING.INR.starter : PRICING.USD.starter;
    if (id === "pro")     return currency === "INR" ? PRICING.INR.pro     : PRICING.USD.pro;
    if (id === "elite")   return currency === "INR" ? PRICING.INR.elite   : PRICING.USD.elite;
    if (id === "byok")    return currency === "INR" ? PRICING.INR.byok    : PRICING.USD.byok;
    return 0;
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();

      const planName = plans.find((p) => p.id === planId)?.name ?? planId;
      const options: Record<string, unknown> = {
        key: data.razorpay_key,
        name: "ATSBYOK",
        description: `${planName} Plan`,
        currency,
        theme: { color: "#1D9E75" },
        handler: async (response: Record<string, string>) => {
          await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: planId, ...response }),
          });
          window.location.reload();
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
      console.error(err);
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {reasonMessages[reason] || "Unlock more optimizations."}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 -mt-1 -mr-1"
          >
            ×
          </button>
        </div>

        {/* Cards */}
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map((plan) => {
            const price = getPrice(plan.id);
            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-4 flex flex-col ${plan.cardClass}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2.5 py-0.5 rounded-full ${plan.badgeClass}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan name */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5 mt-1">
                  {plan.name}
                </p>

                {/* Price */}
                <div className={`text-2xl font-extrabold ${plan.priceClass} leading-none`}>
                  {formatCurrency(price, currency)}
                  <span className="text-xs font-normal text-gray-400 ml-0.5">{plan.billing}</span>
                </div>

                {/* Optimizations */}
                <p className="text-xs text-gray-500 mt-1 mb-3">{plan.optimizations}</p>

                {/* Features */}
                <ul className="flex-1 space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="text-primary font-bold shrink-0 mt-px">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${plan.btnClass}`}
                >
                  {loading === plan.id
                    ? "Processing…"
                    : plan.id === "byok" ? "Get BYOK" : `Get ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Payments secured by Razorpay · Cancel anytime
        </p>
      </div>
    </div>
  );
}
