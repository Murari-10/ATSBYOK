import SmartNavbar from "@/components/SmartNavbar";
import Footer from "@/components/Footer";

const cookies = [
  {
    name: "auth-token",
    purpose: "Supabase authentication session. Keeps you logged in between page visits.",
    type: "Essential",
    duration: "Session / 1 year",
  },
  {
    name: "country",
    purpose: "Your detected country code for showing correct pricing currency.",
    type: "Essential",
    duration: "Session",
  },
  {
    name: "currency",
    purpose: "Your currency preference (INR or USD) derived from your country.",
    type: "Essential",
    duration: "Session",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SmartNavbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-h1 text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-small text-gray-400 mb-10">Last updated: January 2025</p>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">1. What Are Cookies?</h2>
          <p className="text-body text-gray-600 leading-relaxed">
            Cookies are small text files placed in your browser by websites you visit. They help websites remember information about your visit, like whether you are logged in or what currency you prefer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">2. Cookies We Use</h2>
          <p className="text-body text-gray-600 mb-4">
            ATSBYOK uses <strong>essential cookies only</strong>. We use no advertising cookies, no tracking pixels, and no third-party analytics.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-small border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 pr-4 text-gray-700 font-semibold">Cookie</th>
                  <th className="text-left py-3 pr-4 text-gray-700 font-semibold">Purpose</th>
                  <th className="text-left py-3 pr-4 text-gray-700 font-semibold">Type</th>
                  <th className="text-left py-3 text-gray-700 font-semibold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => (
                  <tr key={c.name} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-mono text-gray-900 text-tiny">{c.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{c.purpose}</td>
                    <td className="py-3 pr-4">
                      <span className="badge-pro">{c.type}</span>
                    </td>
                    <td className="py-3 text-gray-600">{c.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">3. Managing Cookies</h2>
          <p className="text-body text-gray-600 leading-relaxed">
            You can clear cookies at any time from your browser settings. Note that clearing authentication cookies will log you out of ATSBYOK and you will need to sign in again. The service requires essential cookies to function — disabling them may break the login flow.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-h3 text-gray-900 mb-3">4. Contact</h2>
          <p className="text-body text-gray-600">
            Cookie questions:{" "}
            <a href="mailto:privacy@atsbyok.com" className="text-primary hover:underline">
              privacy@atsbyok.com
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
