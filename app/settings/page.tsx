"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/Toast";
import { Plan, Provider, Currency } from "@/types";
import { getPlanLabel } from "@/lib/utils/plan";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "anthropic", label: "Anthropic" },
  { id: "gemini", label: "Google Gemini" },
  { id: "openrouter", label: "OpenRouter" },
  { id: "groq", label: "Groq" },
];

const MODELS: Record<Provider, { id: string; label: string }[]> = {
  anthropic: [
    { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 (Faster)" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (Better)" },
  ],
  openrouter: [
  {
    id: "deepseek/deepseek-v4-flash:free",
    label: "DeepSeek V4 Flash (Free)",
  },
  {
    id: "openrouter/owl-alpha",
    label: "Owl Alpha (Free)",
  },
  {
    id: "openai/gpt-oss-20b:free",
    label: "GPT OSS 20B (Free)",
  },
  
  ],
  gemini: [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite" },
  ],
  groq: [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
  { id: "openai/gpt-oss-120b", label: "gpt-oss-120b" },
  { id: "qwen/qwen3-32b", label: "Qwen 3 32B" },
  ],
};

interface ProfileData {
  full_name: string;
  email: string;
  avatar_url: string;
  plan: Plan;
  currency: Currency;
  starter_expires_at: string | null;
  razorpay_subscription_id: string | null;
}

interface ByokData {
  provider: Provider;
  selected_model: string;
  has_key: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // createClient() must be stable across renders — store in ref
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [byok, setByok] = useState<ByokData | null>(null);
  const [loading, setLoading] = useState(true);

  const [provider, setProvider] = useState<Provider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(MODELS.anthropic[0].id);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const byokMsg = searchParams.get("msg") === "byok_required";

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        const profileRes = await fetch("/api/usage");
        if (!profileRes.ok) throw new Error("Failed to load usage");
        const usageData = await profileRes.json();

        setProfile({
          full_name: session.user.user_metadata?.full_name || "",
          email: session.user.email || "",
          avatar_url: session.user.user_metadata?.avatar_url || "",
          plan: usageData.plan,
          currency: usageData.currency,
          starter_expires_at: usageData.starter_expires_at,
          razorpay_subscription_id: null,
        });

        if (usageData.provider) {
          setProvider(usageData.provider as Provider);
          setModel(
            usageData.model || MODELS[usageData.provider as Provider][0].id
          );
          setByok({
            provider: usageData.provider,
            selected_model: usageData.model,
            has_key: true,
          });
        }
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProviderChange = (p: Provider) => {
    setProvider(p);
    setModel(MODELS[p][0].id);
  };

  const handleSaveByok = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/byok/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("API key saved securely.");
      setByok({ provider, selected_model: model, has_key: true });
      setApiKey("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTestByok = async () => {
    if (!apiKey.trim() && !byok?.has_key) return;
    setTesting(true);
    try {
      const res = await fetch("/api/byok/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey || "USE_STORED",
          model,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Connection successful!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!confirm("Delete your API key? If on the BYOK plan, you will be downgraded to Free."))
      return;
    setDeleting(true);
    try {
      await fetch("/api/byok/key", { method: "DELETE" });
      setByok(null);
      setApiKey("");
      window.location.reload();
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDeleteAccount = () => {
    setDeleteInput("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        await supabase.auth.signOut();
        window.location.href = "/";
      } else {
        toast.error("Could not delete account. Email support@atsbyok.com");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {byokMsg && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-orange-800">
              ⚠️ You need to add an API key to use the BYOK plan. Add it below.
            </p>
          </div>
        )}

        {/* Profile */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                {profile?.full_name?.[0] || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{profile?.full_name}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Signed in with Google
              </p>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {profile?.plan ? getPlanLabel(profile.plan) : ""} Plan
              </p>
              {profile?.plan === "starter" && profile.starter_expires_at && (
                <p className="text-sm text-gray-500">
                  Expires:{" "}
                  {new Date(profile.starter_expires_at).toLocaleDateString()}
                </p>
              )}
              {["pro", "elite", "byok"].includes(profile?.plan || "") && (
                <p className="text-sm text-gray-500">Monthly subscription</p>
              )}
            </div>
            <a
              href="/dashboard/pricing"
              className="btn-secondary text-sm py-2 px-4"
            >
              {profile?.plan === "free" || profile?.plan === "starter"
                ? "Upgrade"
                : "Manage Plan"}
            </a>
          </div>
        </div>

        {/* BYOK */}
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-1">
            BYOK — Bring Your Own API Key
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Use your own free API key for unlimited optimizations on the BYOK
            plan.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
              className="input-field"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field"
            >
              {MODELS[provider].map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  byok?.has_key ? "••••••••••••• (key saved)" : "Enter API key"
                }
                className="input-field pr-12"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? "🙈" : "👁"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              🔒 Encrypted with AES-256. Never logged or shared.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveByok}
              disabled={saving || !apiKey.trim()}
              className="btn-primary py-2 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Key"}
            </button>
            <button
              onClick={handleTestByok}
              disabled={testing || (!apiKey.trim() && !byok?.has_key)}
              className="btn-secondary py-2 disabled:opacity-50"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
            {byok?.has_key && (
              <button
                onClick={handleDeleteKey}
                disabled={deleting}
                className="text-sm font-medium text-red-600 hover:text-red-800 px-3 py-2"
              >
                {deleting ? "Deleting..." : "Delete Key"}
              </button>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card border-red-200 bg-red-50">
          <h2 className="font-bold text-red-800 mb-4">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete Account</p>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="text-sm font-semibold text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </main>
      <Footer />

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Delete your account?</h2>
                  <p className="text-xs text-gray-500">This action is permanent and cannot be reversed.</p>
                </div>
              </div>

              {/* What gets deleted */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 space-y-1.5">
                <p className="text-xs font-semibold text-red-800 mb-2">The following will be permanently deleted:</p>
                {[
                  "All resume analyses and optimized resumes",
                  "Your API key (if saved)",
                  "Billing history and subscription",
                  "Your profile and account data",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-red-700">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              {/* Confirmation input */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  spellCheck={false}
                  autoComplete="off"
                  className="input-field font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 btn-secondary py-2.5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteInput !== "DELETE" || deleting}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Deleting…
                    </span>
                  ) : (
                    "Delete My Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
