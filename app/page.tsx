import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";

const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    title: "ATS Score",
    desc: "Get an instant score showing how well your resume passes Applicant Tracking Systems.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
    ),
    title: "BYOK Plan",
    desc: "Connect your own free API endpoint for unlimited optimizations.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    ),
    title: "Resume Optimization",
    desc: "Get a fully rewritten, ATS-optimized resume tailored to the specific job description.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
    title: "Cold Email Templates",
    desc: "Personalized cold emails to hiring managers that actually get responses.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
    title: "LinkedIn Messages",
    desc: "Connection requests and referral messages crafted for maximum response rate.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
    title: "Cover Letters",
    desc: "Cover letters tailored to the role, company, and your background.",
  },
];

const platforms = [
  "Naukri",
  "LinkedIn",
  "Indeed",
  "Internshala",
  "Greenhouse",
  "Workday",
  "Lever",
  "Shine",
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bangalore",
    text: "Got 3 interview calls within a week of optimizing my resume. The ATS score went from 42 to 87!",
    avatar: "PS",
  },
  {
    name: "Arjun Mehta",
    role: "MBA Graduate, Delhi",
    text: "The cold email templates are gold. I landed a referral at Deloitte using the LinkedIn message.",
    avatar: "AM",
  },
  {
    name: "Sarah Chen",
    role: "Product Manager, Singapore",
    text: "The keyword analysis feature showed me exactly what I was missing. Highly recommend for international job seekers.",
    avatar: "SC",
  },
  {
    name: "Rahul Verma",
    role: "Data Analyst, Hyderabad",
    text: "BYOK plan is incredible value. Using my free API key for unlimited optimizations.",
    avatar: "RV",
  },
];

const faqs = [
  {
    q: "What is an ATS?",
    a: "An Applicant Tracking System (ATS) is software used by companies to filter resumes before a human sees them. Most resumes are rejected by ATS before reaching a recruiter. Our tool helps you pass these filters.",
  },
  {
    q: "What is the BYOK plan?",
    a: "The BYOK plan lets you connect your own API key from providers like OpenRouter, Groq, or Google Gemini — many of which have free tiers — for unlimited resume optimizations at just ₹49/month ($2/month).",
  },
  {
    q: "Which free API providers work with the BYOK plan?",
    a: "OpenRouter (Llama 3.3, Gemma 2, Mistral — all free), Groq (Llama 3.3, Gemma 2 — free tier), and Google Gemini (Flash and Pro — free tier). All these providers offer free API access.",
  },
  {
    q: "Is my API key safe?",
    a: "Yes. Your API key is encrypted with AES-256 before being stored. It is never logged, never shared, and only decrypted at the moment of use. You can delete it anytime from Settings.",
  },
  {
    q: "What is the Starter Pack?",
    a: "The Starter Pack is a one-time purchase giving you 15 resume optimizations valid for 30 days. It includes all paid features except Cover Letter, which requires the Elite plan.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. You can upgrade or downgrade your plan at any time from the Settings page. Subscriptions are managed via Razorpay and can be cancelled anytime.",
  },
];

export default async function LandingPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <span>✨</span> Built for Indian & global job markets
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Get Shortlisted Faster —{" "}
            <span className="text-primary">Resume Optimizer</span> for Every
            Job Market
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Optimized for Naukri, LinkedIn, Indeed, Greenhouse, Workday & more.
            Beat ATS filters. Land interviews.
          </p>
          {isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="btn-primary text-lg px-8 py-4 rounded-xl"
              >
                Go to Dashboard →
              </Link>
              <Link
                href="/optimize"
                className="btn-secondary text-lg px-8 py-4 rounded-xl"
              >
                New Optimization
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="btn-primary text-lg px-8 py-4 rounded-xl"
              >
                Start for Free — No Credit Card
              </Link>
              <Link
                href="#pricing"
                className="btn-secondary text-lg px-8 py-4 rounded-xl"
              >
                View Pricing
              </Link>
            </div>
          )}
          <p className="text-sm text-gray-400 mt-4">
            {isLoggedIn
              ? "Welcome back! Continue where you left off."
              : "Free plan: 2 optimizations/month • No signup fees"}
          </p>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
            Optimized for all major platforms
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {platforms.map((p) => (
              <span
                key={p}
                className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Everything You Need to Land the Job
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            From ATS optimization to cold emails — we cover every step of your
            job application.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card hover:border-primary-200 hover:shadow-md transition-[border-color,box-shadow]"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Job Seekers Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <p className="text-gray-700 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-xl border border-gray-200 p-5 group"
              >
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            {isLoggedIn ? "Keep the momentum going!" : "Ready to Land Your Dream Job?"}
          </h2>
          <p className="text-primary-100 mb-8">
            {isLoggedIn
              ? "Optimize your next resume and stay ahead of the competition."
              : "Start free. Upgrade when you need more. No credit card required."}
          </p>
          <Link
            href={isLoggedIn ? "/optimize" : "/login"}
            className="bg-white text-primary font-bold px-8 py-4 rounded-xl text-lg hover:bg-primary-50 transition-colors inline-block"
          >
            {isLoggedIn ? "New Optimization →" : "Start Optimizing for Free"}
          </Link>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
