import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import { PRICING } from "@/types";

const features = [
  { label: "ATS Score", plans: [true, true, true, true, true] },
  { label: "Keyword Analysis", plans: [true, true, true, true, true] },
  { label: "Improvement Suggestions", plans: [true, true, true, true, true] },
  { label: "Copy Resume Text", plans: [true, true, true, true, true] },
  { label: "Download PDF", plans: [false, true, true, true, true] },
  { label: "Cold Email Template", plans: [false, true, true, true, true] },
  {
    label: "LinkedIn Referral Message",
    plans: [false, true, true, true, true],
  },
  { label: "Cover Letter Generator", plans: [false, false, false, true, false] },
  { label: "Own API Key (BYOK plan)", plans: [false, false, false, false, true] },
];

const hourlyLimits = [3, 5, 10, 20, 30];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default async function PricingPage() {
  // Logged-in users get the in-app pricing page
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (session) redirect("/dashboard/pricing");

  const cookieStore = cookies();
  const currency = cookieStore.get("currency")?.value || "USD";
  const isINR = currency === "INR";

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      billing: "forever",
      optimizations: "2/month",
      popular: false,
      highlight: "",
      cta: "Get Started",
      href: "/login",
    },
    {
      id: "starter",
      name: "Starter",
      price: isINR ? PRICING.INR.starter : PRICING.USD.starter,
      billing: "one-time",
      optimizations: "15 total (30 days)",
      popular: false,
      highlight: "Just getting started?",
      cta: "Buy Starter",
      href: "/login?plan=starter",
    },
    {
      id: "pro",
      name: "Pro",
      price: isINR ? PRICING.INR.pro : PRICING.USD.pro,
      billing: "/month",
      optimizations: "30/month",
      popular: true,
      highlight: "Most Popular",
      cta: "Get Pro",
      href: "/login?plan=pro",
    },
    {
      id: "elite",
      name: "Elite",
      price: isINR ? PRICING.INR.elite : PRICING.USD.elite,
      billing: "/month",
      optimizations: "100/month",
      popular: false,
      highlight: "Best for Active Job Seekers",
      cta: "Get Elite",
      href: "/login?plan=elite",
    },
    {
      id: "byok",
      name: "BYOK",
      price: isINR ? PRICING.INR.byok : PRICING.USD.byok,
      billing: "/month",
      optimizations: "Unlimited",
      popular: false,
      highlight: "Use Your Free API Key",
      cta: "Get BYOK",
      href: "/login?plan=byok",
    },
  ];

  const formatPrice = (price: number) => {
    if (price === 0) return isINR ? "₹0" : "$0";
    const sym = isINR ? "₹" : "$";
    return `${sym}${price % 1 === 0 ? price : price.toFixed(2)}`;
  };

  const planColors = [
    "border-gray-200",
    "border-blue-200 bg-blue-50",
    "border-primary bg-primary-50",
    "border-purple-200 bg-purple-50",
    "border-orange-200 bg-orange-50",
  ];

  const ctaColors = [
    "btn-secondary",
    "border-2 border-blue-500 text-blue-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors block text-center",
    "btn-primary block text-center py-2.5",
    "border-2 border-purple-500 text-purple-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors block text-center",
    "border-2 border-orange-500 text-orange-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-50 transition-colors block text-center",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 text-lg">
            Prices shown in{" "}
            {isINR ? "Indian Rupees (₹)" : "US Dollars ($)"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Currency detected automatically from your location
          </p>
        </div>

        {/* Plan cards */}
        <h2 className="sr-only">Available Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-5 flex flex-col ${planColors[idx]}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              {plan.highlight && !plan.popular && (
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  {plan.highlight}
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 mb-3">
                <span className="text-3xl font-extrabold text-gray-900">
                  {formatPrice(plan.price)}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {plan.billing}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {plan.optimizations}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {hourlyLimits[idx]}/hour rate limit
              </p>

              <div className="mt-auto">
                <Link href={plan.href} className={ctaColors[idx]}>
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="card overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Feature Comparison
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 pr-4 font-semibold text-gray-700 w-1/3">
                  Feature
                </th>
                {plans.map((p) => (
                  <th key={p.id} className="text-center py-3 px-2 font-semibold text-gray-700">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr
                  key={f.label}
                  className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="py-3 pr-4 text-gray-700">{f.label}</td>
                  {f.plans.map((has, pi) => (
                    <td key={pi} className="text-center py-3 px-2">
                      {has ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-gray-200">
                <td className="py-3 pr-4 text-gray-700 font-medium">
                  Requests/hour
                </td>
                {hourlyLimits.map((l, pi) => (
                  <td key={pi} className="text-center py-3 px-2 text-gray-600">
                    {l}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* BYOK explanation */}
        <div id="byok" className="mt-8 bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            What is the BYOK plan?
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            The BYOK plan lets you connect your own free API key from these
            providers:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <p className="font-semibold">OpenRouter</p>
              <p className="text-gray-500 text-xs">Llama, Gemma, Mistral — free</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <p className="font-semibold">Groq</p>
              <p className="text-gray-500 text-xs">Llama 3.3, Gemma — free tier</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <p className="font-semibold">Google Gemini</p>
              <p className="text-gray-500 text-xs">Flash & Pro — free tier</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-100">
              <p className="font-semibold">Anthropic</p>
              <p className="text-gray-500 text-xs">Haiku & Sonnet — paid</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/login" className="btn-primary text-lg px-10 py-4 rounded-xl inline-block">
            Start for Free
          </Link>
          <p className="text-sm text-gray-400 mt-3">
            No credit card required for free plan
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
