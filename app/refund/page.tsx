import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SmartNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-h1 text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-small text-gray-400 mb-10">Last updated: January 2025</p>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">1. Starter Pack (₹99 / $4.99)</h2>
          <p className="text-body text-gray-600 leading-relaxed">
            The Starter Pack is <strong>non-refundable</strong> once purchased. Upon payment, you immediately receive access to 15 resume optimization credits. Because the service is delivered instantly and digitally, we are unable to process refunds for this one-time purchase.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">2. Pro / Elite / BYOK Subscriptions</h2>
          <ul className="space-y-2">
            {[
              "You may cancel your subscription at any time — no cancellation fees.",
              "After cancellation, you retain access until the end of your current billing period.",
              "We do not issue refunds for the current billing period already paid.",
              "Exception: if you were charged after a confirmed cancellation due to a technical error on our part, contact us within 7 days of the charge for a full refund.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-body text-gray-600">
                <span className="text-primary shrink-0 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">3. How to Cancel</h2>
          <p className="text-body text-gray-600">
            Go to <strong>/settings</strong> → Plan → Cancel Subscription. You can also email{" "}
            <a href="mailto:support@atsbyok.com" className="text-primary hover:underline">
              support@atsbyok.com
            </a>{" "}
            and we will process your cancellation within 1 business day.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">4. Requesting a Refund (Exceptions Only)</h2>
          <ul className="space-y-2">
            {[
              "Email support@atsbyok.com within 7 days of the charge in question.",
              "Include your registered email address and the Razorpay payment ID.",
              "We review and respond within 2 business days.",
              "Approved refunds are processed back to your original payment method within 5–7 business days.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-body text-gray-600">
                <span className="text-primary shrink-0 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">5. Contact</h2>
          <p className="text-body text-gray-600">
            Billing questions:{" "}
            <a href="mailto:support@atsbyok.com" className="text-primary hover:underline">
              support@atsbyok.com
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
