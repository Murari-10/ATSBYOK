import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using ATSBYOK, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the service.",
  },
  {
    title: "2. Description of Service",
    content: "ATSBYOK is an AI-powered resume optimization tool. We help users improve their resumes for Applicant Tracking Systems (ATS) and specific job platforms including Naukri, LinkedIn, Indeed, Greenhouse, Workday, Lever, and Jobvite.",
  },
  {
    title: "3. User Accounts",
    list: [
      "You must be at least 16 years old to use ATSBYOK.",
      "You are responsible for maintaining the security of your account.",
      "One account per person — sharing accounts is not permitted.",
      "Google OAuth is our only login method. We do not store passwords.",
    ],
  },
  {
    title: "4. Acceptable Use",
    content: "You may NOT:",
    list: [
      "Use the service to create fraudulent or misleading resumes.",
      "Share your account credentials with other people.",
      "Attempt to reverse engineer, scrape, or copy the platform.",
      "Use automated bots or scripts to make API requests beyond normal use.",
      "Use the service for any illegal purpose.",
    ],
  },
  {
    title: "5. Subscription and Payments",
    list: [
      "Free plan: 2 optimizations per month at no cost, forever.",
      "Starter Pack: ₹99 / $4.99 one-time payment, valid 30 days from purchase, non-refundable.",
      "Pro / Elite / BYOK: monthly subscriptions billed via Razorpay.",
      "Subscriptions auto-renew each month unless cancelled.",
      "Cancel anytime from Settings — no cancellation fees.",
    ],
  },
  {
    title: "6. Refunds",
    content: "Please see our Refund Policy at /refund for full details on refund eligibility.",
  },
  {
    title: "7. AI-Generated Content",
    list: [
      "Resume suggestions, rewrites, and messages are AI-generated and may contain errors.",
      "You are responsible for reviewing all AI output before submitting job applications.",
      "We do not guarantee job interviews, callbacks, or employment outcomes.",
    ],
  },
  {
    title: "8. Intellectual Property",
    content: "Your resume content remains entirely yours. ATSBYOK owns all platform code, design, branding, and AI prompt systems.",
  },
  {
    title: "9. Limitation of Liability",
    content: "ATSBYOK is not liable for job application outcomes, missed opportunities, data loss, or temporary service interruptions. Our maximum liability is limited to the amount you paid in the 30 days prior to the claim.",
  },
  {
    title: "10. Changes to Terms",
    content: "We may update these Terms from time to time. We will notify users of material changes via email or a notice in the app. Continued use of ATSBYOK after changes constitutes acceptance.",
  },
  {
    title: "11. Contact",
    content: "For legal questions, email legal@atsbyok.com.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SmartNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-h1 text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-small text-gray-400 mb-10">Last updated: May 2026</p>

        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-h3 text-gray-900 mb-3">{s.title}</h2>
            {s.content && <p className="text-body text-gray-600 mb-2 leading-relaxed">{s.content}</p>}
            {s.list && (
              <ul className="space-y-2 mt-2">
                {s.list.map((item) => (
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
