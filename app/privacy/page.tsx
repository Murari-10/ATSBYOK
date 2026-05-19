import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SmartNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-h1 text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-small text-gray-400 mb-10">Last updated: May 2026</p>

        {[
          {
            title: "1. Introduction",
            content: `ATSBYOK ("we", "us", "our") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights regarding your personal information.`,
          },
          {
            title: "2. Data We Collect",
            content: null,
            list: [
              "Account data: your name and email address from Google OAuth sign-in.",
              "Resume content: text you upload or paste, stored securely in our database.",
              "Usage data: optimization count, plan type, and timestamps of your activity.",
              "Payment data: handled entirely by Razorpay. We do not store card numbers or banking details.",
              "API keys (BYOK plan): encrypted with AES-256 before storage. Never logged, never shared with third parties.",
            ],
          },
          {
            title: "3. How We Use Your Data",
            content: null,
            list: [
              "To provide and improve resume optimization services.",
              "To manage your subscription and process billing through Razorpay.",
              "To show you your optimization history in your dashboard.",
              "We do NOT sell your data to third parties.",
              "We do NOT use your resume content to train AI models.",
            ],
          },
          {
            title: "4. Data Storage",
            content: "Your data is stored on Supabase, hosted on AWS infrastructure. Uploaded files (PDF/DOCX) are deleted immediately after text extraction — only the extracted text is stored. Resume analysis results are retained to power your dashboard history.",
          },
          {
            title: "5. Your Rights",
            content: null,
            list: [
              "Access your data anytime from your dashboard.",
              "Delete your account and all associated data from /settings → Danger Zone.",
              "Request a full data export by contacting privacy@atsbyok.com.",
            ],
          },
          {
            title: "6. Cookies",
            content: "We use essential cookies only: an authentication session cookie from Supabase, and cookies for country and currency detection. We use no advertising cookies, no tracking pixels, and no third-party analytics cookies.",
          },
          {
            title: "7. Third-Party Services",
            content: null,
            list: [
              "Supabase — database and authentication (AWS-hosted)",
              "Razorpay — payment processing",
              "Anthropic, OpenRouter, Groq, Google — AI inference (only when you run an optimization)",
              "Vercel — application hosting",
            ],
          },
          {
            title: "8. Contact",
            content: "For privacy-related questions or data requests, email privacy@atsbyok.com. We respond within 5 business days.",
          },
        ].map((section) => (
          <section key={section.title} className="mb-8">
            <h2 className="text-h3 text-gray-900 mb-3">{section.title}</h2>
            {section.content && (
              <p className="text-body text-gray-600 leading-relaxed">{section.content}</p>
            )}
            {section.list && (
              <ul className="space-y-2 mt-2">
                {section.list.map((item) => (
                  <li key={item} className="flex gap-2 text-body text-gray-600">
                    <span className="text-primary shrink-0 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
