"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "./Logo";
import { Plan } from "@/types";

interface UserInfo {
  name: string;
  email: string;
  avatar: string;
  plan: Plan;
}

const PLAN_BADGE: Record<Plan, string> = {
  free: "badge-free",
  starter: "badge-starter",
  pro: "badge-pro",
  elite: "badge-elite",
  byok: "badge-byok",
};

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  elite: "Elite",
  byok: "BYOK",
};

export default function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserInfo | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setUserLoading(false); return; }

        // Set name + avatar immediately from session (no API needed)
        const baseUser: UserInfo = {
          name: session.user.user_metadata?.full_name || session.user.email || "User",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || "",
          plan: "free",
        };
        setUser(baseUser);
        setUserLoading(false);

        // Load plan in background — doesn't block the avatar from showing
        fetch("/api/usage")
          .then((r) => r.ok ? r.json() : null)
          .then((usage) => {
            if (usage?.plan) setUser((u) => u ? { ...u, plan: usage.plan } : u);
          })
          .catch(() => {});
      } catch {
        setUserLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); setUserLoading(false); return; }
      setUser({
        name: session.user.user_metadata?.full_name || session.user.email || "User",
        email: session.user.email || "",
        avatar: session.user.user_metadata?.avatar_url || "",
        plan: "free",
      });
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm transition-colors duration-150 ${
      isActive(path)
        ? "text-primary font-medium border-b-2 border-primary pb-0.5"
        : "text-gray-500 hover:text-gray-900"
    }`;

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Optimize", href: "/optimize" },
    { label: "Pricing", href: "/dashboard/pricing" },
    { label: "Billing", href: "/dashboard/billing" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-page mx-auto px-6 h-16 grid grid-cols-3 items-center">
        {/* Left — Logo */}
        <div className="flex items-center">
          <Logo href="/dashboard" />
        </div>

        {/* Center — Nav links */}
        <div className="hidden sm:flex items-center justify-center gap-6">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`flex items-center h-11 ${navLinkClass(l.href)}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — Avatar + hamburger */}
        <div className="flex items-center justify-end gap-2">

        {/* Avatar: always reserve space, show skeleton while loading */}
        {userLoading ? (
          <div className="hidden sm:flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="hidden sm:block w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
            >
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={32} height={32}
                  className="rounded-full shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user.name.split(" ")[0]}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 bg-white border border-gray-200 rounded-modal shadow-dropdown py-1 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-tiny text-gray-400 truncate mt-0.5">{user.email}</p>
                  <span className={`${PLAN_BADGE[user.plan]} mt-2`}>
                    {PLAN_LABEL[user.plan]} Plan
                  </span>
                </div>

                <div className="py-1">
                  <Link href="/dashboard/pricing" onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-primary font-medium hover:bg-primary-light transition-colors">
                    Upgrade Plan
                  </Link>
                  <Link href="/settings" onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Settings
                  </Link>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        </div>{/* end right col */}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-2">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className={`block text-sm py-2 transition-colors ${isActive(l.href) ? "text-primary font-medium" : "text-gray-700 hover:text-primary"}`}>
              {l.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-2">
            <button onClick={handleSignOut}
              className="text-sm text-red-500 font-medium">Sign out</button>
          </div>
        </div>
      )}
    </nav>
  );
}
