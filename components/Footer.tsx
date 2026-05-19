"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productLinks = isLoggedIn
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Optimize", href: "/optimize" },
        { label: "Pricing", href: "/dashboard/pricing" },
        { label: "Billing", href: "/dashboard/billing" },
      ]
    : [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/pricing" },
        { label: "BYOK", href: "/pricing#byok" },
      ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  const connectLinks = [
    { label: "Contact Us", href: "/contact" },
    { label: "Twitter / X", href: "https://twitter.com", external: true },
    { label: "LinkedIn", href: "https://linkedin.com", external: true },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-page mx-auto px-6 pt-8 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold">
              <span className="text-gray-900">ATS</span>
              <span className="text-primary">BYOK</span>
            </span>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              ATS resume optimizer — bring your free API key for unlimited optimizations
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-3">Product</p>
            {productLinks.map((l) => (
              <Link key={l.label} href={l.href}
                className="flex items-center min-h-[44px] sm:min-h-0 sm:mb-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-3">Legal</p>
            {legalLinks.map((l) => (
              <Link key={l.label} href={l.href}
                className="flex items-center min-h-[44px] sm:min-h-0 sm:mb-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest mb-3">Connect</p>
            {connectLinks.map((l) => (
              <a key={l.label} href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="flex items-center min-h-[44px] sm:min-h-0 sm:mb-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
                {l.external && <span className="ml-1 text-gray-400">↗</span>}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">© 2026 ATSBYOK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
