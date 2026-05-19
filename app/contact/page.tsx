"use client";

import { useState } from "react";
import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";

const subjects = [
  "Billing & Payments",
  "Technical Issue",
  "Feature Request",
  "Privacy & Data",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: subjects[0], message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SmartNavbar />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
        <h1 className="text-h1 text-gray-900 mb-2">Get in Touch</h1>
        <p className="text-body text-gray-500 mb-10">
          Have a question or need help? We typically respond within 24 hours.
        </p>

        {/* Contact emails */}
        <div className="card-sm mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "General Support", email: "support@atsbyok.com" },
            { label: "Privacy", email: "privacy@atsbyok.com" },
            { label: "Legal", email: "legal@atsbyok.com" },
          ].map((c) => (
            <div key={c.label}>
              <p className="text-tiny font-semibold text-gray-400 uppercase tracking-wider mb-1">{c.label}</p>
              <a href={`mailto:${c.email}`} className="text-small text-primary hover:underline">{c.email}</a>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="card text-center py-12">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
              <span className="text-primary text-xl font-bold">✓</span>
            </div>
            <h2 className="text-h3 text-gray-900 mb-2">Thanks, we&apos;ll be in touch!</h2>
            <p className="text-body text-gray-500">
              Your message has been received. We&apos;ll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-small font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-small font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-small font-medium text-gray-700 mb-1.5">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="select-field"
              >
                {subjects.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-small font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                required rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your question or issue..."
                className="textarea-field"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3">
              Send Message
            </button>
          </form>
        )}

        <p className="text-small text-gray-400 text-center mt-8">
          ATSBYOK is a fully remote product. We operate globally and support users worldwide.
        </p>
      </main>
      <Footer />
    </div>
  );
}
