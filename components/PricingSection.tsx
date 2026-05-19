"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING } from "@/types";

const PLANS = [
  {
    id: "free",
    name: "Free",
    INR: "₹0",
    USD: "$0",
    billing: null,
    optimizations: "2/month",
    color: "card text-center",
    priceColor: "text-gray-900",
    features: ["✅ ATS Score", "✅ Keyword Analysis", "✅ Suggestions", "❌ PDF Download", "❌ Cold Email"],
    cta: "Get Started Free",
    ctaClass: "btn-secondary w-full block py-2.5",
    badge: null,
  },
  {
    id: "byok",
    name: "BYOK",
    INR: `₹${PRICING.INR.byok}`,
    USD: `$${PRICING.USD.byok}`,
    billing: "/month",
    optimizations: "Unlimited",
    color: "card text-center border-orange-200 bg-orange-50 relative",
    priceColor: "text-orange-600",
    features: ["✅ Unlimited optimizations", "✅ Use free API keys", "✅ PDF + Email + LinkedIn", "✅ AES-256 encrypted"],
    cta: "Get BYOK",
    ctaClass: "block w-full py-2.5 rounded-btn border-2 border-orange-500 text-orange-600 text-sm font-medium text-center hover:bg-orange-100 transition-colors",
    badge: { text: "Use Free API Key", bg: "bg-orange-500" },
  },
  {
    id: "pro",
    name: "Pro",
    INR: `₹${PRICING.INR.pro}`,
    USD: `$${PRICING.USD.pro}`,
    billing: "/month",
    optimizations: "30/month",
    color: "card text-center border-primary bg-primary-50 relative",
    priceColor: "text-primary",
    features: ["✅ All Free features", "✅ PDF Download", "✅ Cold Email", "✅ LinkedIn Messages", "❌ Cover Letter"],
    cta: "Get Pro",
    ctaClass: "btn-primary w-full block py-2.5",
    badge: { text: "Most Popular", bg: "bg-primary" },
  },
  {
    id: "elite",
    name: "Elite",
    INR: `₹${PRICING.INR.elite}`,
    USD: `$${PRICING.USD.elite}`,
    billing: "/month",
    optimizations: "100/month",
    color: "card text-center border-purple-200 bg-purple-50 relative",
    priceColor: "text-purple-700",
    features: ["✅ All Pro features", "✅ 100 optimizations/month", "✅ Cover Letter"],
    cta: "Get Elite",
    ctaClass: "block w-full py-2.5 rounded-btn border-2 border-purple-600 text-purple-700 text-sm font-medium text-center hover:bg-purple-100 transition-colors",
    badge: { text: "Active Job Seekers", bg: "bg-purple-600" },
  },
];

export default function PricingSection() {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const isINR = currency === "INR";

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>

        {/* Currency toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-medium transition-colors ${isINR ? "text-gray-900" : "text-gray-400"}`}>
            ₹ INR
          </span>
          <button
            onClick={() => setCurrency(isINR ? "USD" : "INR")}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
              isINR ? "bg-primary" : "bg-gray-300"
            }`}
            aria-label="Toggle currency"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                isINR ? "translate-x-0" : "translate-x-5"
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${!isINR ? "text-gray-900" : "text-gray-400"}`}>
            $ USD
          </span>
        </div>

        {/* Starter callout */}
        <div className="bg-blue-50 border border-blue-200 rounded-card p-4 text-center mb-8 max-w-md mx-auto">
          <p className="text-sm font-medium text-blue-800">
            Just getting started?{" "}
            <strong>Starter Pack — {isINR ? `₹${PRICING.INR.starter}` : `$${PRICING.USD.starter}`} one-time</strong>{" "}
            for 15 optimizations, 30 days.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div key={plan.id} className={plan.color}>
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${plan.badge.bg} text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap`}>
                  {plan.badge.text}
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>

              <div className={`text-3xl font-extrabold ${plan.priceColor} my-3`}>
                {isINR ? plan.INR : plan.USD}
                {plan.billing && (
                  <span className="text-sm font-normal text-gray-500">{plan.billing}</span>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4">{plan.optimizations}</p>

              <ul className="text-sm text-left space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">{f}</li>
                ))}
              </ul>

              <Link href="/login" className={plan.ctaClass}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
